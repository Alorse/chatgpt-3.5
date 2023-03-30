package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type Database struct {
	// The database connection
	db *sql.DB

	// The database connection string
	connectionString string

	// The database driver
	driver string

	// The database name
	name string

	// The database user
	user string

	// The database password
	password string

	// The database host
	host string

	// The database port
	port string
}

// Creates a new database object
func NewDatabase(driver string, name string, user string, password string, host string, port string) *Database {
	return &Database{
		driver:   driver,
		name:     name,
		user:     user,
		password: password,
		host:     host,
		port:     port,
	}
}

// Connects to the database
func (t *Database) Connect() error {
	t.connectionString = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", t.user, t.password, t.host, t.port, t.name)
	db, err := sql.Open(t.driver, t.connectionString+"?multiStatements=true&parseTime=true&interpolateParams=true")
	if err != nil {
		return err
	}
	db.SetConnMaxLifetime(time.Minute * 10)
	db.SetMaxOpenConns(50)
	db.SetMaxIdleConns(20)
	t.db = db
	return nil
}

// Closes the database connection
func (t *Database) Close() error {
	return t.db.Close()
}

// Returns the database connection
func (t *Database) GetConnection() *sql.DB {
	return t.db
}

// get Database
func (t *Database) GetDB() *sql.DB {
	return t.db
}

// get ErrNoRows
func (t *Database) ErrNoRows() error {
	return sql.ErrNoRows
}
