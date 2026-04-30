package service

import (
	"context"
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"log/slog"
	"math"
	"sort"
	"sync"
	"time"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
)

const (
	defaultForecastDays = 30
	defaultHistoryDays  = 90

	minForecastDays = 1
	maxForecastDays = 365

	minHistoryDays = 7
	maxHistoryDays = 1095

	forecastCacheTTL      = 120 * time.Second
	forecastCacheMaxItems = 5000
)

type ForecastRepository interface {
	GetProductsWithSales(ctx context.Context, historyDays int) ([]model.ProductInput, error)
}

type ForecastService struct {
	repository ForecastRepository

	cacheMu sync.RWMutex
	cache   map[string]forecastCacheItem
}

type forecastCacheItem struct {
	createdAt time.Time
	values    []int
	method    string
}

func NewForecastService(repository ForecastRepository) *ForecastService {
	return &ForecastService{
		repository: repository,
		cache:      make(map[string]forecastCacheItem),
	}
}

func (s *ForecastService) GetForecast(ctx context.Context, days int, historyDays int) ([]model.ForecastDetail, error) {
	days, historyDays, err := normalizeForecastParams(days, historyDays)
	if err != nil {
		return nil, err
	}

	products, err := s.repository.GetProductsWithSales(ctx, historyDays)
	if err != nil {
		slog.Debug("failed to get products with sales", "error", err, "history_days", historyDays)
		return nil, err
	}

	fctx := buildForecastContext(days, historyDays, time.Now())

	results := make([]model.ForecastDetail, 0, len(products))

	for i := range products {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		p := products[i]

		values, method := s.predict(p, fctx)
		total := sumInts(values)

		dailyBreakdown := make([]model.DailyPoint, 0, len(values))
		for j, qty := range values {
			dailyBreakdown = append(dailyBreakdown, model.DailyPoint{
				Date:     fctx.FutureDates[j].Format("2006-01-02"),
				Quantity: qty,
			})
		}

		results = append(results, model.ForecastDetail{
			ProductID:      p.ProductID,
			ProductName:    p.ProductName,
			SKU:            p.SKU,
			ForecastTotal: total,
			DailyAvg:       round2(float64(total) / float64(fctx.ForecastDays)),
			DailyBreakdown: dailyBreakdown,
			Method:         method,
		})
	}

	return results, nil
}

func (s *ForecastService) GetRecommendations(ctx context.Context, days int, historyDays int) ([]model.RecommendationItem, error) {
	days, historyDays, err := normalizeForecastParams(days, historyDays)
	if err != nil {
		return nil, err
	}

	products, err := s.repository.GetProductsWithSales(ctx, historyDays)
	if err != nil {
		slog.Debug("failed to get products with sales", "error", err, "history_days", historyDays)
		return nil, err
	}

	fctx := buildForecastContext(days, historyDays, time.Now())

	results := make([]model.RecommendationItem, 0)

	for i := range products {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		p := products[i]

		values, _ := s.predict(p, fctx)

		total := sumInts(values)
		dailyAvg := float64(total) / float64(fctx.ForecastDays)

		orderQty := total - p.CurrentStock
		if orderQty <= 0 {
			continue
		}

		stockDays := 999
		if dailyAvg > 0 {
			stockDays = int(math.Floor(float64(p.CurrentStock) / dailyAvg))
		}

		urgency := "ok"
		if stockDays <= 7 {
			urgency = "high"
		} else if stockDays <= 14 {
			urgency = "medium"
		}

		results = append(results, model.RecommendationItem{
			ProductID:      p.ProductID,
			ProductName:    p.ProductName,
			SKU:            p.SKU,
			CurrentStock:   p.CurrentStock,
			ForecastTotal:  total,
			RecommendOrder: orderQty,
			StockDaysLeft:  stockDays,
			Urgency:         urgency,
		})
	}

	sort.Slice(results, func(i, j int) bool {
		return urgencyPriority(results[i].Urgency) < urgencyPriority(results[j].Urgency)
	})

	return results, nil
}

func (s *ForecastService) GetForecastMonthly(ctx context.Context, days int, historyDays int) ([]model.MonthlyPoint, error) {
	days, historyDays, err := normalizeForecastParams(days, historyDays)
	if err != nil {
		return nil, err
	}

	products, err := s.repository.GetProductsWithSales(ctx, historyDays)
	if err != nil {
		slog.Debug("failed to get products with sales for monthly forecast", "error", err, "history_days", historyDays)
		return nil, err
	}

	fctx := buildForecastContext(days, historyDays, time.Now())

	qtyByMonth := make(map[string]int)
	revByMonth := make(map[string]float64)

	for i := range products {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		p := products[i]

		values, _ := s.predict(p, fctx)

		for j, qty := range values {
			month := fctx.FutureMonths[j]

			qtyByMonth[month] += qty
			revByMonth[month] += float64(qty) * p.Price
		}
	}

	months := make([]string, 0, len(qtyByMonth))
	for month := range qtyByMonth {
		months = append(months, month)
	}

	sort.Strings(months)

	result := make([]model.MonthlyPoint, 0, len(months))

	for _, month := range months {
		result = append(result, model.MonthlyPoint{
			Month:           month,
			ForecastQty:     qtyByMonth[month],
			ForecastRevenue: round2(revByMonth[month]),
		})
	}

	return result, nil
}

//_____________________Вспомогательные функции_____________________//

type forecastContext struct {
	Today           time.Time
	HistoryStart    time.Time
	ForecastDays    int
	HistoryDays     int
	FutureDates     []time.Time
	FutureMonths    []string
	HistoryWeekdays []int
	FutureWeekdays  []int
}

func normalizeForecastParams(days int, historyDays int) (int, int, error) {
	if days == 0 {
		days = defaultForecastDays
	}

	if historyDays == 0 {
		historyDays = defaultHistoryDays
	}

	if days < minForecastDays || days > maxForecastDays {
		return 0, 0, fmt.Errorf("forecast days must be between %d and %d", minForecastDays, maxForecastDays)
	}

	if historyDays < minHistoryDays || historyDays > maxHistoryDays {
		return 0, 0, fmt.Errorf("history days must be between %d and %d", minHistoryDays, maxHistoryDays)
	}

	return days, historyDays, nil
}

func buildForecastContext(days int, historyDays int, now time.Time) forecastContext {
	today := dateOnly(now)
	historyStart := today.AddDate(0, 0, -historyDays+1)

	futureDates := make([]time.Time, days)
	futureMonths := make([]string, days)
	futureWeekdays := make([]int, days)

	for i := 0; i < days; i++ {
		d := today.AddDate(0, 0, i+1)

		futureDates[i] = d
		futureMonths[i] = monthStartString(d)
		futureWeekdays[i] = weekdayIndex(d)
	}

	historyWeekdays := make([]int, historyDays)

	for i := 0; i < historyDays; i++ {
		d := historyStart.AddDate(0, 0, i)
		historyWeekdays[i] = weekdayIndex(d)
	}

	return forecastContext{
		Today:           today,
		HistoryStart:    historyStart,
		ForecastDays:    days,
		HistoryDays:     historyDays,
		FutureDates:     futureDates,
		FutureMonths:    futureMonths,
		HistoryWeekdays: historyWeekdays,
		FutureWeekdays:  futureWeekdays,
	}
}

func (s *ForecastService) predict(product model.ProductInput, fctx forecastContext) ([]int, string) {
	y := buildHistoryArray(product.Sales, fctx)

	cacheKey := makeForecastCacheKey(product.ProductID, fctx, y)

	if values, method, ok := s.cacheGet(cacheKey); ok {
		return values, method + "_cached"
	}

	values, method := predictFromHistory(y, fctx)

	s.cacheSet(cacheKey, values, method)

	return values, method
}

func predictFromHistory(y []float64, fctx forecastContext) ([]int, string) {
	totalSold := sumFloat64(y)
	nonZeroDays := countNonZeroDays(y)

	if totalSold <= 0 {
		return make([]int, fctx.ForecastDays), "no_data"
	}

	if nonZeroDays < 3 {
		forecastTotal := int(math.Round(totalSold / float64(fctx.HistoryDays) * float64(fctx.ForecastDays)))
		return spreadTotal(forecastTotal, fctx.ForecastDays), "mean_fallback"
	}

	avgInterval := float64(fctx.HistoryDays) / math.Max(1, float64(nonZeroDays))

	if nonZeroDays < 14 || avgInterval > 7 {
		forecastFloat := crostonSBAForecast(y, fctx.ForecastDays, 0.1)
		forecastTotal := int(math.Round(sumFloat64(forecastFloat)))

		return spreadTotal(forecastTotal, fctx.ForecastDays), "croston_sba"
	}

	forecastFloat := regularDemandForecast(y, fctx)

	return integerizePreservingTotal(forecastFloat), "ewma_weekly"
}

func buildHistoryArray(sales []model.SaleRecord, fctx forecastContext) []float64 {
	y := make([]float64, fctx.HistoryDays)

	for _, sale := range sales {
		if sale.Quantity <= 0 {
			continue
		}

		soldAt := dateOnly(sale.SoldAt)
		idx := daysBetween(fctx.HistoryStart, soldAt)

		if idx >= 0 && idx < fctx.HistoryDays {
			y[idx] += float64(sale.Quantity)
		}
	}

	return y
}

func crostonSBAForecast(y []float64, forecastDays int, alpha float64) []float64 {
	result := make([]float64, forecastDays)

	if alpha <= 0 || alpha > 1 {
		alpha = 0.1
	}

	positions := make([]int, 0)

	for i, v := range y {
		if v > 0 {
			positions = append(positions, i)
		}
	}

	if len(positions) == 0 {
		return result
	}

	firstPos := positions[0]

	z := y[firstPos]
	p := float64(firstPos + 1)

	lastPos := firstPos

	for _, pos := range positions[1:] {
		interval := pos - lastPos
		if interval < 1 {
			interval = 1
		}

		demand := y[pos]

		z = alpha*demand + (1-alpha)*z
		p = alpha*float64(interval) + (1-alpha)*p

		lastPos = pos
	}

	rate := (1 - alpha/2) * z / math.Max(p, 1)

	lastGap := len(y) - 1 - positions[len(positions)-1]
	if float64(lastGap) > p {
		coef := p / math.Max(1, float64(lastGap))
		coef = clamp(coef, 0.2, 1.0)

		rate *= coef
	}

	if rate < 0 || math.IsNaN(rate) || math.IsInf(rate, 0) {
		rate = 0
	}

	for i := range result {
		result[i] = rate
	}

	return result
}

func regularDemandForecast(y []float64, fctx forecastContext) []float64 {
	result := make([]float64, fctx.ForecastDays)

	n := len(y)
	if n == 0 {
		return result
	}

	last7 := meanLast(y, 7)
	last28 := meanLast(y, 28)
	last90 := meanLast(y, 90)

	ewmaAlpha := 0.2
	ewma := y[0]

	for _, value := range y[1:] {
		ewma = ewmaAlpha*value + (1-ewmaAlpha)*ewma
	}

	level := 0.10*last7 + 0.55*last28 + 0.20*last90 + 0.15*ewma
	level = math.Max(0, level)

	factors := weekdayFactors(y, fctx.HistoryWeekdays)

	var prev28 float64

	if n >= 56 {
		prev28 = meanRange(y, n-56, n-28)
	} else if n > 28 {
		prev28 = meanRange(y, 0, n-28)
	} else {
		prev28 = last28
	}

	dailyGrowth := 0.0
	if prev28 > 0 {
		dailyGrowth = (last28 - prev28) / prev28 / 28.0
	}

	dailyGrowth = clamp(dailyGrowth, -0.01, 0.01)

	for i := 0; i < fctx.ForecastDays; i++ {
		weekday := fctx.FutureWeekdays[i]

		seasonal := factors[weekday]
		trend := clamp(1+dailyGrowth*float64(i+1), 0.5, 1.5)

		value := level * seasonal * trend

		if value < 0 || math.IsNaN(value) || math.IsInf(value, 0) {
			value = 0
		}

		result[i] = value
	}

	return result
}

func weekdayFactors(y []float64, historyWeekdays []int) []float64 {
	factors := make([]float64, 7)

	for i := range factors {
		factors[i] = 1
	}

	overall := meanRange(y, 0, len(y))
	if overall <= 0 {
		return factors
	}

	sums := make([]float64, 7)
	counts := make([]int, 7)

	for i, value := range y {
		if i >= len(historyWeekdays) {
			break
		}

		weekday := historyWeekdays[i]
		if weekday < 0 || weekday > 6 {
			continue
		}

		sums[weekday] += value
		counts[weekday]++
	}

	for weekday := 0; weekday < 7; weekday++ {
		if counts[weekday] >= 2 {
			factors[weekday] = sums[weekday] / float64(counts[weekday]) / overall
		}

		factors[weekday] = clamp(factors[weekday], 0.5, 2.0)
	}

	avgFactor := 0.0
	for _, factor := range factors {
		avgFactor += factor
	}

	avgFactor /= 7.0

	if avgFactor > 0 {
		for i := range factors {
			factors[i] = factors[i] / avgFactor
		}
	}

	return factors
}

func spreadTotal(total int, days int) []int {
	if days <= 0 {
		return []int{}
	}

	values := make([]int, days)

	if total <= 0 {
		return values
	}

	base := total / days
	remainder := total % days

	if base > 0 {
		for i := range values {
			values[i] = base
		}
	}

	if remainder > 0 {
		for i := 0; i < remainder; i++ {
			idx := i * days / remainder
			values[idx]++
		}
	}

	return values
}

func integerizePreservingTotal(values []float64) []int {
	if len(values) == 0 {
		return []int{}
	}

	floors := make([]int, len(values))

	type fractionItem struct {
		idx      int
		fraction float64
	}

	fractions := make([]fractionItem, 0, len(values))

	totalFloat := 0.0
	totalFloors := 0

	for i, value := range values {
		if value < 0 || math.IsNaN(value) || math.IsInf(value, 0) {
			value = 0
		}

		totalFloat += value

		floorValue := int(math.Floor(value))
		floors[i] = floorValue
		totalFloors += floorValue

		fractions = append(fractions, fractionItem{
			idx:      i,
			fraction: value - float64(floorValue),
		})
	}

	targetTotal := int(math.Round(totalFloat))
	diff := targetTotal - totalFloors

	if diff <= 0 {
		return floors
	}

	sort.Slice(fractions, func(i, j int) bool {
		if fractions[i].fraction == fractions[j].fraction {
			return fractions[i].idx < fractions[j].idx
		}

		return fractions[i].fraction > fractions[j].fraction
	})

	if diff > len(fractions) {
		diff = len(fractions)
	}

	for i := 0; i < diff; i++ {
		floors[fractions[i].idx]++
	}

	return floors
}

func meanLast(values []float64, window int) float64 {
	n := len(values)
	if n == 0 {
		return 0
	}

	if window <= 0 || n < window {
		return meanRange(values, 0, n)
	}

	return meanRange(values, n-window, n)
}

func meanRange(values []float64, start int, end int) float64 {
	if len(values) == 0 {
		return 0
	}

	if start < 0 {
		start = 0
	}

	if end > len(values) {
		end = len(values)
	}

	if end <= start {
		return 0
	}

	sum := 0.0

	for _, value := range values[start:end] {
		sum += value
	}

	return sum / float64(end-start)
}

func sumFloat64(values []float64) float64 {
	sum := 0.0

	for _, value := range values {
		sum += value
	}

	return sum
}

func sumInts(values []int) int {
	sum := 0

	for _, value := range values {
		sum += value
	}

	return sum
}

func countNonZeroDays(values []float64) int {
	count := 0

	for _, value := range values {
		if value > 0 {
			count++
		}
	}

	return count
}

func round2(value float64) float64 {
	return math.Round(value*100) / 100
}

func clamp(value float64, minValue float64, maxValue float64) float64 {
	if value < minValue {
		return minValue
	}

	if value > maxValue {
		return maxValue
	}

	return value
}

func urgencyPriority(urgency string) int {
	switch urgency {
	case "high":
		return 0
	case "medium":
		return 1
	case "ok":
		return 2
	default:
		return 3
	}
}

func dateOnly(t time.Time) time.Time {
	year, month, day := t.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

func daysBetween(start time.Time, end time.Time) int {
	return int(end.Sub(start).Hours() / 24)
}

func weekdayIndex(t time.Time) int {
	return int(t.Weekday())
}

func monthStartString(t time.Time) string {
	return time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.UTC).Format("2006-01-02")
}

func (s *ForecastService) cacheGet(key string) ([]int, string, bool) {
	s.cacheMu.RLock()
	item, ok := s.cache[key]
	s.cacheMu.RUnlock()

	if !ok {
		return nil, "", false
	}

	if time.Since(item.createdAt) > forecastCacheTTL {
		s.cacheMu.Lock()
		delete(s.cache, key)
		s.cacheMu.Unlock()

		return nil, "", false
	}

	return cloneIntSlice(item.values), item.method, true
}

func (s *ForecastService) cacheSet(key string, values []int, method string) {
	s.cacheMu.Lock()
	defer s.cacheMu.Unlock()

	if s.cache == nil {
		s.cache = make(map[string]forecastCacheItem)
	}

	s.cache[key] = forecastCacheItem{
		createdAt: time.Now(),
		values:    cloneIntSlice(values),
		method:    method,
	}

	if len(s.cache) <= forecastCacheMaxItems {
		return
	}

	now := time.Now()

	for cacheKey, item := range s.cache {
		if now.Sub(item.createdAt) > forecastCacheTTL {
			delete(s.cache, cacheKey)
		}
	}

	for len(s.cache) > forecastCacheMaxItems {
		for cacheKey := range s.cache {
			delete(s.cache, cacheKey)
			break
		}
	}
}

func makeForecastCacheKey(productID int, fctx forecastContext, y []float64) string {
	hash := sha256.New()

	var buf [8]byte

	writeInt64 := func(value int64) {
		binary.LittleEndian.PutUint64(buf[:], uint64(value))
		_, _ = hash.Write(buf[:])
	}

	writeInt64(int64(productID))
	writeInt64(fctx.Today.Unix())
	writeInt64(int64(fctx.ForecastDays))
	writeInt64(int64(fctx.HistoryDays))

	for _, value := range y {
		writeInt64(int64(math.Round(value)))
	}

	return fmt.Sprintf("%x", hash.Sum(nil))
}

func cloneIntSlice(values []int) []int {
	if values == nil {
		return nil
	}

	cloned := make([]int, len(values))
	copy(cloned, values)

	return cloned
}

