export interface DatabaseConnection {
    query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[]; rowCount: number }>;
    transaction<T>(callback: (client: DatabaseConnection) => Promise<T>): Promise<T>;
}
class MockDatabaseConnection implements DatabaseConnection {
    async query<T = unknown>(_text: string, _params?: unknown[]): Promise<{ rows: T[]; rowCount: number }> {
        void _text; void _params; // Explicitly mark as used
        return { rows: [], rowCount: 0 };
    }
    async transaction<T>(callback: (client: DatabaseConnection) => Promise<T>): Promise<T> {
        return callback(this);
    }
}
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
}
export class Database {
    private static instance: DatabaseConnection | null = null;
    static async connect(config?: DatabaseConfig): Promise<DatabaseConnection> {
        if (!Database.instance) {
            if (config) {
                Database.instance = new MockDatabaseConnection();
            } else {
                Database.instance = new MockDatabaseConnection();
            }
        }
        return Database.instance;
    }
    static async disconnect(): Promise<void> {
        if (Database.instance) {
            Database.instance = null;
        }
    }
}
export class QueryBuilder {
    static select(table: string, columns: string[] = ['*']): string {
        return `SELECT ${columns.join(', ')} FROM ${table}`;
    }    static insert(table: string, data: Record<string, unknown>): { query: string; values: unknown[] } {
        const columns = Object.keys(data);
        const placeholders = columns.map((_, index) => `$${index + 1}`);
        const values = Object.values(data);
        return {
            query: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
            values
        };
    }
    static update(table: string, data: Record<string, unknown>, where: string): { query: string; values: unknown[] } {
        const columns = Object.keys(data);
        const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
        const values = Object.values(data);
        return {
            query: `UPDATE ${table} SET ${setClause} WHERE ${where} RETURNING *`,
            values
        };
    }
    static delete(table: string, where: string): string {
        return `DELETE FROM ${table} WHERE ${where}`;
    }
    static whereIn(column: string, values: unknown[]): { clause: string; params: unknown[] } {
        const placeholders = values.map((_, index) => `$${index + 1}`);
        return {
            clause: `${column} IN (${placeholders.join(', ')})`,
            params: values
        };
    }
}
