
const express = require('express');
const mariadb = require('mariadb');
const app = express();
const port = 3000;

// MariaDB 연결 풀 설정
const pool = mariadb.createPool({
  host: '127.0.0.1', // MariaDB 서버 주소
  user: 'root',      // MariaDB 사용자 이름
  password: '3396', // 여기에 실제 root 비밀번호를 입력하세요!
  database: 'portfolio_db', // 사용할 데이터베이스 이름
  connectionLimit: 5 // 최대 연결 수
});

// 데이터베이스 연결 테스트 함수
async function testDbConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Connected to MariaDB successfully!');
  } catch (err) {
    console.error('Error connecting to MariaDB:', err);
  } finally {
    if (conn) conn.release(); // 연결 반환
  }
}

// API endpoint to get all projects
app.get('/api/projects', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT id, title, description, image_url, link, tags, project_date, custom_readme_content FROM projects ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  } finally {
    if (conn) conn.release();
  }
});

// 정적 파일 서비스
app.use(express.static('public'));

// API endpoint to add a new project
app.post('/api/projects', express.json(), async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { title, description, image_url, link, tags, project_date, custom_readme_content } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await conn.query(
      "INSERT INTO projects (title, description, image_url, link, tags, project_date, custom_readme_content) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, description, image_url, link, tags, project_date, custom_readme_content]
    );
    res.status(201).json({ message: 'Project added successfully', id: result.insertId });
  } catch (err) {
    console.error('Error adding project:', err);
    res.status(500).json({ error: 'Failed to add project' });
  } finally {
    if (conn) conn.release();
  }
});

// 서버 시작
app.listen(port, async () => { // async 키워드 추가
  console.log(`Server is running at http://localhost:${port}`);
  await testDbConnection(); // 서버 시작 후 DB 연결 테스트
});
