package request

type DetailsSaleRequest struct {
	From string `json:"from" validate:"omitempty,datetime=2006-01-02"`
	To   string `json:"to"   validate:"omitempty,datetime=2006-01-02"`
}