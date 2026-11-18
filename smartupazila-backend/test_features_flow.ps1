# ==============================================================================
# Smart Upazila API Integration Test: Features, Uploads, Remarks & Assignments
# ==============================================================================
$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$baseUrl = "http://localhost:3000/api"

function Assert-Equal($actual, $expected, $desc) {
    if ($actual -eq $expected) {
        Write-Host " PASS: $desc" -ForegroundColor Green
    } else {
        Write-Host " FAIL: $desc (Expected: $expected, Actual: $actual)" -ForegroundColor Red
    }
}

Write-Host "=== TEST 1: Admin Login ===" -ForegroundColor Cyan
$adminLogin = @{
    phoneNumber = "01700000000"
    password = "admin123"
} | ConvertTo-Json

try {
    $adminAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($adminLogin)) -ContentType "application/json; charset=utf-8"
    $adminToken = $adminAuth.access_token
    Write-Host " Admin logged in successfully! Role: $($adminAuth.user.role)" -ForegroundColor Green
} catch {
    Write-Host " Admin login failed. Is the server running? Run 'npm run start:dev' first." -ForegroundColor Red
    exit 1
}

$adminHeaders = @{
    Authorization = "Bearer $adminToken"
}

Write-Host "`n=== TEST 2: Admin Adds a Food Item (POST /api/foods) ===" -ForegroundColor Cyan
$randomId = Get-Random -Minimum 100 -Maximum 999
