package main

import (
	"github.com/AVGsync/analysis-pro/backend/internal/app/apiserver"
)

func main() {
	config, err := apiserver.NewConfig()
	if err != nil {
		panic(err)
	}

	s, err := apiserver.New(config) 
	if err != nil {
		panic(err)
	}

	if err := s.Start(); err != nil {
		panic(err)
	}
}