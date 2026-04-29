package request

type DetailsSaleRequest struct {
	// Начало периода включительно в формате YYYY-MM-DD. Пустое значение означает отсутствие нижней границы.
	From string `json:"from" validate:"omitempty,datetime=2006-01-02" example:"2026-02-01"`
	// Конец периода включительно в формате YYYY-MM-DD. Пустое значение означает отсутствие верхней границы.
	To string `json:"to" validate:"omitempty,datetime=2006-01-02" example:"2026-04-30"`
}
