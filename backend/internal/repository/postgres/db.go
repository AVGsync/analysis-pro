package postgres

import (
	"database/sql"

	_ "github.com/lib/pq"
)

type DB struct {
	databaseURL     string
	db 					 		*sql.DB
}

func New(databaseURL string) *DB {
	return &DB{
		databaseURL: databaseURL,
	}
}

func (d *DB) Open() error {
	db, err := sql.Open("postgres", d.databaseURL)
	if err != nil {
		return err
	}
	if err := db.Ping(); err != nil {
		return err
	}

	d.db = db
	return nil
}

func (d *DB) Close() {
	d.db.Close()
}

func (d *DB) User() *UserRepository {
	return &UserRepository{database: d}
}