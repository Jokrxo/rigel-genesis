import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Users, FileText, TrendingUp, Tag, AlertCircle } from "lucide-react";

export const ERDiagram = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Financial Analysis Engine - Entity Relationship Diagram
          </CardTitle>
          <CardDescription>
            Database schema showing relationships between all financial analysis tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Main ERD Diagram */}
            <div className="relative bg-muted/20 p-8 rounded-lg overflow-x-auto min-h-[600px]">
              <svg
                viewBox="0 0 1000 600"
                className="w-full h-full"
                style={{ minWidth: '1000px', minHeight: '600px' }}
              >
                {/* Users (auth.users) */}
                <g transform="translate(50, 50)">
                  <rect width="150" height="80" fill="hsl(var(--primary))" fillOpacity="0.1" stroke="hsl(var(--primary))" strokeWidth="2" rx="8" />
                  <text x="75" y="20" textAnchor="middle" className="font-semibold" fontSize="14" fill="hsl(var(--foreground))">auth.users</text>
                  <text x="10" y="40" fontSize="12" fill="hsl(var(--foreground))">🔑 id (UUID)</text>
                  <text x="10" y="55" fontSize="12" fill="hsl(var(--foreground))">📧 email</text>
                  <text x="10" y="70" fontSize="12" fill="hsl(var(--foreground))">📅 created_at</text>
                </g>

                {/* Files */}
                <g transform="translate(300, 50)">
                  <rect width="180" height="140" fill="hsl(var(--secondary))" fillOpacity="0.1" stroke="hsl(var(--secondary))" strokeWidth="2" rx="8" />
                  <text x="90" y="20" textAnchor="middle" className="font-semibold" fontSize="14" fill="hsl(var(--foreground))">files</text>
                  <text x="10" y="40" fontSize="12" fill="hsl(var(--foreground))">🔑 id (UUID)</text>
                  <text x="10" y="55" fontSize="12" fill="hsl(var(--foreground))">🔗 user_id → auth.users.id</text>
                  <text x="10" y="70" fontSize="12" fill="hsl(var(--foreground))">📄 file_name</text>
                  <text x="10" y="85" fontSize="12" fill="hsl(var(--foreground))">📝 file_type</text>
                  <text x="10" y="100" fontSize="12" fill="hsl(var(--foreground))">💾 file_url</text>
                  <text x="10" y="115" fontSize="12" fill="hsl(var(--foreground))">⚡ processing_status</text>
                  <text x="10" y="130" fontSize="12" fill="hsl(var(--foreground))">📊 processing_metadata</text>
                </g>

                {/* Transactions */}
                <g transform="translate(550, 50)">
                  <rect width="200" height="200" fill="hsl(var(--accent))" fillOpacity="0.1" stroke="hsl(var(--accent))" strokeWidth="2" rx="8" />
                  <text x="100" y="20" textAnchor="middle" className="font-semibold" fontSize="14" fill="hsl(var(--foreground))">transactions</text>
                  <text x="10" y="40" fontSize="12" fill="hsl(var(--foreground))">🔑 id (UUID)</text>
                  <text x="10" y="55" fontSize="12" fill="hsl(var(--foreground))">🔗 user_id → auth.users.id</text>
                  <text x="10" y="70" fontSize="12" fill="hsl(var(--foreground))">🔗 file_id → files.id</text>
                  <text x="10" y="85" fontSize="12" fill="hsl(var(--foreground))">📅 date</text>
                  <text x="10" y="100" fontSize="12" fill="hsl(var(--foreground))">📝 description</text>
                  <text x="10" y="115" fontSize="12" fill="hsl(var(--foreground))">💰 amount</text>
                  <text x="10" y="130" fontSize="12" fill="hsl(var(--foreground))">💸 debit</text>
                  <text x="10" y="145" fontSize="12" fill="hsl(var(--foreground))">💵 credit</text>
                  <text x="10" y="160" fontSize="12" fill="hsl(var(--foreground))">🏷️ category</text>
                  <text x="10" y="175" fontSize="12" fill="hsl(var(--foreground))">📈 confidence_score</text>
                  <text x="10" y="190" fontSize="12" fill="hsl(var(--foreground))">🎯 metadata</text>
                </g>

                {/* Financial Statements */}
                <g transform="translate(50, 300)">
                  <rect width="200" height="140" fill="hsl(var(--chart-1))" fillOpacity="0.1" stroke="hsl(var(--chart-1))" strokeWidth="2" rx="8" />
                  <text x="100" y="20" textAnchor="middle" className="font-semibold" fontSize="14" fill="hsl(var(--foreground))">financial_statements</text>
                  <text x="10" y="40" fontSize="12" fill="hsl(var(--foreground))">🔑 id (UUID)</text>
                  <text x="10" y="55" fontSize="12" fill="hsl(var(--foreground))">🔗 user_id → auth.users.id</text>
                  <text x="10" y="70" fontSize="12" fill="hsl(var(--foreground))">🔗 file_id → files.id</text>
                  <text x="10" y="85" fontSize="12" fill="hsl(var(--foreground))">📊 statement_type</text>
                  <text x="10" y="100" fontSize="12" fill="hsl(var(--foreground))">📅 period_start/end</text>
                  <text x="10" y="115" fontSize="12" fill="hsl(var(--foreground))">📈 statement_data (JSON)</text>
                  <text x="10" y="130" fontSize="12" fill="hsl(var(--foreground))">📊 ratios (JSON)</text>
                </g>

                {/* ML Tags */}
                <g transform="translate(300, 300)">
                  <rect width="180" height="120" fill="hsl(var(--chart-2))" fillOpacity="0.1" stroke="hsl(var(--chart-2))" strokeWidth="2" rx="8" />
                  <text x="90" y="20" textAnchor="middle" className="font-semibold" fontSize="14" fill="hsl(var(--foreground))">ml_tags</text>
                  <text x="10" y="40" fontSize="12" fill="hsl(var(--foreground))">🔑 id (UUID)</text>
                  <text x="10" y="55" fontSize="12" fill="hsl(var(--foreground))">🔗 transaction_id → transactions.id</text>
                  <text x="10" y="70" fontSize="12" fill="hsl(var(--foreground))">🏷️ tag_type</text>
                  <text x="10" y="85" fontSize="12" fill="hsl(var(--foreground))">💬 tag_value</text>
                  <text x="10" y="100" fontSize="12" fill="hsl(var(--foreground))">📈 confidence_score</text>
                  <text x="10" y="115" fontSize="12" fill="hsl(var(--foreground))">🤖 model_version</text>
                </g>

                {/* Data Issues */}
                <g transform="translate(550, 300)">
                  <rect width="180" height="140" fill="hsl(var(--chart-3))" fillOpacity="0.1" stroke="hsl(var(--chart-3))" strokeWidth="2" rx="8" />
                  <text x="90" y="20" textAnchor="middle" className="font-semibold" fontSize="14" fill="hsl(var(--foreground))">data_issues</text>
                  <text x="10" y="40" fontSize="12" fill="hsl(var(--foreground))">🔑 id (UUID)</text>
                  <text x="10" y="55" fontSize="12" fill="hsl(var(--foreground))">🔗 user_id → auth.users.id</text>
                  <text x="10" y="70" fontSize="12" fill="hsl(var(--foreground))">🔗 file_id → files.id</text>
                  <text x="10" y="85" fontSize="12" fill="hsl(var(--foreground))">🔗 transaction_id → transactions.id</text>
                  <text x="10" y="100" fontSize="12" fill="hsl(var(--foreground))">⚠️ issue_type</text>
                  <text x="10" y="115" fontSize="12" fill="hsl(var(--foreground))">📝 issue_description</text>
                  <text x="10" y="130" fontSize="12" fill="hsl(var(--foreground))">🚨 severity</text>
                </g>

                {/* Relationship Lines */}
                {/* Users to Files (1:N) */}
                <line x1="200" y1="90" x2="300" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="240" y="85" fontSize="10" textAnchor="middle" fill="hsl(var(--foreground))">1:N</text>

                {/* Users to Transactions (1:N) */}
                <line x1="200" y1="110" x2="550" y2="150" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="360" y="125" fontSize="10" textAnchor="middle" fill="hsl(var(--foreground))">1:N</text>

                {/* Files to Transactions (1:N) */}
                <line x1="480" y1="120" x2="550" y2="120" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="515" y="115" fontSize="10" textAnchor="middle" fill="hsl(var(--foreground))">1:N</text>

                {/* Users to Financial Statements (1:N) */}
                <line x1="125" y1="130" x2="125" y2="300" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="105" y="220" fontSize="10" textAnchor="middle" fill="hsl(var(--foreground))">1:N</text>

                {/* Files to Financial Statements (1:N) */}
                <line x1="350" y1="190" x2="200" y2="300" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="275" y="240" fontSize="10" textAnchor="middle" fill="hsl(var(--foreground))">1:N</text>

                {/* Transactions to ML Tags (1:N) */}
                <line x1="600" y1="250" x2="420" y2="300" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="510" y="270" fontSize="10" textAnchor="middle" fill="hsl(var(--foreground))">1:N</text>

                {/* Transactions to Data Issues (1:N) */}
                <line x1="650" y1="250" x2="650" y2="300" stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <text x="670" y="275" fontSize="10" textAnchor="middle" fill="hsl(var(--foreground))">1:N</text>

                {/* Arrow marker definition */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--foreground))" />
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Core Tables
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>auth.users:</strong> Supabase authentication</p>
                  <p><strong>files:</strong> Uploaded documents</p>
                  <p><strong>transactions:</strong> Parsed financial data</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Analysis Tables
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>financial_statements:</strong> Generated reports</p>
                  <p><strong>ml_tags:</strong> AI categorization</p>
                  <p><strong>data_issues:</strong> Quality tracking</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>🔒 Row Level Security (RLS)</p>
                  <p>🔄 Automatic timestamps</p>
                  <p>📊 JSON metadata storage</p>
                </CardContent>
              </Card>
            </div>

            {/* Relationship Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Relationship Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>One-to-Many Relationships:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                    <li>One User can have many Files (upload multiple statements)</li>
                    <li>One User can have many Transactions (from all their files)</li>
                    <li>One File can contain many Transactions (parsed from statement)</li>
                    <li>One User can have many Financial Statements (for different periods)</li>
                    <li>One Transaction can have many ML Tags (category, deductibility, etc.)</li>
                    <li>One User/File/Transaction can have many Data Issues (validation problems)</li>
                  </ul>
                </div>
                <div>
                  <strong>Data Flow:</strong>
                  <p className="text-muted-foreground mt-1">
                    File Upload → AI Processing → Transaction Extraction → ML Categorization → Financial Statement Generation → Issue Tracking
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};