import express from 'express';
import pg from 'pg';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',       
  database: 'postgres',
  port: 5432,
  password: 'secret'
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Startseite Route
app.get('/', (req, res) => {
  res.send('Willkommen zur Kundenverwaltung!');
});

// API-Route zum Abrufen aller Mitarbeiter mit optionaler Filter- und Suchfunktion
app.get('/api/employees', async (req, res) => {
  // Prüft, ob nur aktive Mitarbeiter gefiltert werden sollen
  const onlyActive = req.query.active === 'true';
  // Optionaler Suchbegriff für Name oder E-Mail
  const search = req.query.search || '';

  // Grundlegende SQL-Abfrage
  let sql = 'SELECT * FROM employees';
  const params = [];

  // Wenn ein Suchbegriff vorhanden ist, wird die WHERE-Klausel ergänzt
  if (search) {
    sql += ' WHERE (firstname ILIKE $1 OR lastname ILIKE $1 OR email ILIKE $1)';
    params.push(`%${search}%`);
    // Falls zusätzlich nach aktiven Mitarbeitern gefiltert werden soll
    if (onlyActive) {
      sql += ' AND active = true';
    }
  } else if (onlyActive) {
    // Nur aktive Mitarbeiter ohne Suchbegriff
    sql += ' WHERE active = true';
  }

  // Sortiert das Ergebnis nach der ID
  sql += ' ORDER BY id';

  try {
    // Führt die SQL-Abfrage mit den Parametern aus
    const result = await pool.query(sql, params);
    // Gibt die gefundenen Mitarbeiter als JSON zurück
    res.json(result.rows);
  } catch (error) {
    // Fehlerbehandlung bei Datenbankproblemen
    console.error('Fehler beim Abrufen:', error);
    res.status(500).send('Serverfehler');
  }
});

// API-Route zum Hinzufügen eines Mitarbeiters
app.post('/api/employees', async (req, res) => {
  console.log('Body empfangen:', req.body);
  const { firstname, lastname, email, position, hired_date, active } = req.body;

  try {
    await pool.query(
      `INSERT INTO employees (firstname, lastname, email, position, hired_date, active)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [firstname, lastname, email, position, hired_date, active]
    );
    res.status(201).send('Mitarbeiter erfolgreich hinzugefügt');
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Mitarbeiters:', error);
    res.status(500).send('Fehler beim Hinzufügen');
  }
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
