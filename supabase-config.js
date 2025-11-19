// Supabase 配置文件
const SUPABASE_CONFIG = {
    url: 'https://yadavunhzbjmsozwvgyt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZGF2dW5oemJqbXNvend2Z3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MDAwODksImV4cCI6MjA3OTA3NjA4OX0.TKEtnZJSSvin3hc77rPS6FUzzPFh76tAEJPk7umqmpE'
};

// 创建 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// 导出 Supabase 客户端
window.supabaseClient = supabase;