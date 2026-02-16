$envData = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "https://cjmnsbpauckchnkyjjhe.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqbW5zYnBhdWNrY2hua3lqamhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NTA3OTEsImV4cCI6MjA4NjEyNjc5MX0.BOPhYQIfYWo7QsmNg-_JPY0_5UKXscs67oe8d-ucKLM"
    "DATABASE_URL" = "postgresql://postgres.cjmnsbpauckchnkyjjhe:ShahidIqbal123@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
    "ADMIN_DEFAULT_EMAIL" = "admin@medixra.com"
    "ADMIN_DEFAULT_PASSWORD" = "Admin@12345"
    "ADMIN_DEFAULT_NAME" = "Medixra Admin"
    "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqbW5zYnBhdWNrY2hua3lqamhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU1MDc5MSwiZXhwIjoyMDg2MTI2NzkxfQ.JLWDuEU7NLRbwUkkrG1adcd2fpxvaTCjoz_uPISbMpc"
}

foreach ($key in $envData.Keys) {
    $value = $envData[$key]
    Write-Host "Adding $key..."
    
    # Remove existing to allow overwrite/add - silencing output
    cmd /c "echo y | vercel env rm $key production" | Out-Null
    
    # Add new value using cmd for reliable piping
    cmd /c "echo $value | vercel env add $key production"
}
