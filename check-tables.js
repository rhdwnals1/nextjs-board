import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

try {
  // 테이블 목록 확인
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  
  console.log("📋 현재 DB 테이블 목록:");
  tables.forEach(t => console.log(`  - ${t.table_name}`));
  
  // boards 테이블 존재 확인
  const hasBoards = tables.some(t => t.table_name === 'boards');
  const hasPosts = tables.some(t => t.table_name === 'posts');
  
  console.log("\n✅ boards 테이블 존재:", hasBoards);
  console.log("❌ posts 테이블 존재:", hasPosts);
  
  // comments 테이블 컬럼 확인
  if (tables.some(t => t.table_name === 'comments')) {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'comments'
      ORDER BY ordinal_position;
    `;
    console.log("\n📝 comments 테이블 컬럼:");
    columns.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
    
    const hasBoardId = columns.some(c => c.column_name === 'board_id');
    const hasPostId = columns.some(c => c.column_name === 'post_id');
    console.log("\n✅ board_id 컬럼 존재:", hasBoardId);
    console.log("❌ post_id 컬럼 존재:", hasPostId);
  }
  
} catch (error) {
  console.error("❌ 에러:", error.message);
} finally {
  await sql.end();
}
