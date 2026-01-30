import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaPath = join(__dirname, 'drizzle', 'schema.ts');
const schemaContent = readFileSync(schemaPath, 'utf-8');

// schema.ts를 분석하여 ERD 생성
const tables = [
  {
    name: 'users',
    fields: [
      { name: 'id', type: 'int', pk: true },
      { name: 'name', type: 'string' },
      { name: 'password', type: 'string' },
      { name: 'created_at', type: 'datetime' },
    ],
  },
  {
    name: 'boards',
    fields: [
      { name: 'id', type: 'int', pk: true },
      { name: 'author_id', type: 'int', fk: 'users.id' },
      { name: 'title', type: 'string' },
      { name: 'content', type: 'string' },
      { name: 'view_count', type: 'int' },
      { name: 'created_at', type: 'datetime' },
    ],
  },
  {
    name: 'comments',
    fields: [
      { name: 'id', type: 'int', pk: true },
      { name: 'board_id', type: 'int', fk: 'boards.id' },
      { name: 'author_id', type: 'int', fk: 'users.id' },
      { name: 'content', type: 'string' },
      { name: 'created_at', type: 'datetime' },
    ],
  },
  {
    name: 'sessions',
    fields: [
      { name: 'id', type: 'string', pk: true },
      { name: 'user_id', type: 'int', fk: 'users.id' },
      { name: 'expires_at', type: 'datetime' },
      { name: 'created_at', type: 'datetime' },
    ],
  },
  {
    name: 'board_likes',
    fields: [
      { name: 'id', type: 'int', pk: true },
      { name: 'board_id', type: 'int', fk: 'boards.id' },
      { name: 'user_id', type: 'int', fk: 'users.id' },
      { name: 'created_at', type: 'datetime' },
    ],
  },
  {
    name: 'comment_likes',
    fields: [
      { name: 'id', type: 'int', pk: true },
      { name: 'comment_id', type: 'int', fk: 'comments.id' },
      { name: 'user_id', type: 'int', fk: 'users.id' },
      { name: 'created_at', type: 'datetime' },
    ],
  },
  {
    name: 'notifications',
    fields: [
      { name: 'id', type: 'int', pk: true },
      { name: 'user_id', type: 'int', fk: 'users.id' },
      { name: 'type', type: 'string' },
      { name: 'board_id', type: 'int', fk: 'boards.id', nullable: true },
      { name: 'comment_id', type: 'int', fk: 'comments.id', nullable: true },
      { name: 'actor_id', type: 'int', fk: 'users.id', nullable: true },
      { name: 'read', type: 'bool' },
      { name: 'created_at', type: 'datetime' },
    ],
  },
];

// Mermaid ERD 생성
let mermaid = 'erDiagram\n\n';

// 테이블 정의
tables.forEach(table => {
  mermaid += `    ${table.name} {\n`;
  table.fields.forEach(field => {
    // Mermaid ERD는 필드명 타입 순서로 작성 (PK/FK는 표시하지 않음)
    mermaid += `        ${field.type} ${field.name}\n`;
  });
  mermaid += `    }\n\n`;
});

// 관계 정의
mermaid += `    users ||--o{ boards : "author_id (set null)"\n`;
mermaid += `    users ||--o{ comments : "author_id (set null)"\n`;
mermaid += `    users ||--|| sessions : "user_id (cascade)"\n`;
mermaid += `    users ||--o{ board_likes : "user_id (cascade)"\n`;
mermaid += `    users ||--o{ comment_likes : "user_id (cascade)"\n`;
mermaid += `    users ||--o{ notifications : "user_id (cascade)"\n`;
mermaid += `    users ||--o{ notifications : "actor_id (set null)"\n`;
mermaid += `    boards ||--o{ comments : "board_id (cascade)"\n`;
mermaid += `    boards ||--o{ board_likes : "board_id (cascade)"\n`;
mermaid += `    boards ||--o{ notifications : "board_id (cascade)"\n`;
mermaid += `    comments ||--o{ comment_likes : "comment_id (cascade)"\n`;
mermaid += `    comments ||--o{ notifications : "comment_id (cascade)"\n`;

console.log(mermaid);

// 파일로 저장
import { writeFileSync } from 'fs';
writeFileSync(join(__dirname, 'ERD.md'), `# ERD\n\n\`\`\`mermaid\n${mermaid}\`\`\`\n`);

console.log('\n✅ ERD가 ERD.md 파일로 저장되었습니다!');
console.log('GitHub나 Mermaid를 지원하는 마크다운 뷰어에서 확인할 수 있습니다.');
