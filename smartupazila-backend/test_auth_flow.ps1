$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$baseUrl = "http://localhost:3000/api"

function Assert-Equal($actual, $expected, $desc) {
    if ($actual -eq $expected) {
        Write-Host " PASS: $desc" -ForegroundColor Green
    } else {
        Write-Host " FAIL: $desc (Expected: $expected, Actual: $actual)" -ForegroundColor Red
    }
}

Write-Host "=== TEST 1: Public Citizen Registration ===" -ForegroundColor Cyan
$randomSuffix = Get-Random -Minimum 1000 -Maximum 9999
$citizenPhone = ("018" + $randomSuffix + "5678").Substring(0, 11)
$citizenEmail = "citizen$randomSuffix@test.com"
$citizenNid = ("199" + $randomSuffix + "12345").Substring(0, 10)

$regBody = @{
    name = "তানভীর আহমেদ"
    phoneNumber = $citizenPhone
    email = $citizenEmail
    nid = $citizenNid
    address = "গ্রাম: চরপাড়া, ইউনিয়ন: সদর"
    password = "password123"
} | ConvertTo-Json -Depth 5

try {
    $regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($regBody)) -ContentType "application/json; charset=utf-8"
    Write-Host " Registration successful: $($regRes.message)" -ForegroundColor Green
} catch {
    Write-Host " Registration failed: $_" -ForegroundColor Red
}

Write-Host "`n=== TEST 2: Citizen Login Before Approval (Must be 403) ===" -ForegroundColor Cyan
$loginBody = @{
    phoneNumber = $citizenPhone
    password = "password123"
} | ConvertTo-Json -Depth 5

try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($loginBody)) -ContentType "application/json; charset=utf-8"
    Write-Host " FAIL: Login should have been blocked before approval!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Equal $statusCode 403 "Login returns 403 Forbidden when isApproved = false"
}

Write-Host "`n=== TEST 3: Validation & Duplicate Protection ===" -ForegroundColor Cyan
# Duplicate phone
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($regBody)) -ContentType "application/json; charset=utf-8"
    Write-Host " FAIL: Duplicate registration allowed!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Equal $statusCode 409 "Duplicate phoneNumber returns 409 Conflict"
}

# Invalid NID (less than 10 digits)
$badNidBody = @{
    name = "টেস্ট"
    phoneNumber = "01899999999"
    email = "badnid@test.com"
    nid = "12345"
    address = "ঢাকা"
    password = "password123"
} | ConvertTo-Json -Depth 5

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($badNidBody)) -ContentType "application/json; charset=utf-8"
    Write-Host " FAIL: Invalid NID was accepted!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Equal $statusCode 400 "Invalid NID returns 400 Bad Request"
}

Write-Host "`n=== TEST 4: Unauthorized User cannot create staff (401 / 403) ===" -ForegroundColor Cyan
$staffBody = @{
    name = "নতুন ইঞ্জিনিয়ার"
    phoneNumber = "01788888888"
    role = "OFFICER"
    department = "WATER"
    password = "password123"
} | ConvertTo-Json -Depth 5

try {
    Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($staffBody)) -ContentType "application/json; charset=utf-8"
    Write-Host " FAIL: Unauthenticated user was able to hit /admin/users!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Equal $statusCode 401 "Unauthenticated POST /admin/users returns 401"
}

Write-Host "`n=== TEST 5: Admin Login and Staff Creation ===" -ForegroundColor Cyan
$adminLogin = @{
    phoneNumber = "01700000000"
