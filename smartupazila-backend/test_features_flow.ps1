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
$foodBody = @{
    name = "স্পেশাল রসমালাই $randomId"
    description = "টাটকা খাঁটি ছানার সুস্বাদু রসমালাই"
    category = "মিষ্টি"
    isAreaSpecial = $true
    priceRange = "৩০০-৫০০ টাকা/কেজি"
    address = "চকবাজার, উপজেলা সদর"
    imageUrl = "https://res.cloudinary.com/hhj1x5qm/image/upload/v1794935457/smartupazila/foods/sample.jpg"
} | ConvertTo-Json -Depth 5

$foodRes = Invoke-RestMethod -Uri "$baseUrl/foods" -Method Post -Headers $adminHeaders -Body ([System.Text.Encoding]::UTF8.GetBytes($foodBody)) -ContentType "application/json; charset=utf-8"
Assert-Equal ($foodRes.id -ne $null) $true "Food created with ID: $($foodRes.id)"
Assert-Equal $foodRes.name "স্পেশাল রসমালাই $randomId" "Food name verified"

Write-Host "`n=== TEST 3: Admin Adds a Historical Place (POST /api/places) ===" -ForegroundColor Cyan
$placeBody = @{
    name = "ঐতিহাসিক পুরনো জামে মসজিদ $randomId"
    description = "৩০০ বছরের প্রাচীন মোঘল আমলের স্থাপত্য"
    category = "RELIGIOUS"
    address = "বাজার রোড, উপজেলা সদর"
    entryFee = "মুক্ত"
    openingHours = "সারাদিন খোলা"
    imageUrl = "https://res.cloudinary.com/hhj1x5qm/image/upload/v1794935457/smartupazila/places/mosque.jpg"
} | ConvertTo-Json -Depth 5

$placeRes = Invoke-RestMethod -Uri "$baseUrl/places" -Method Post -Headers $adminHeaders -Body ([System.Text.Encoding]::UTF8.GetBytes($placeBody)) -ContentType "application/json; charset=utf-8"
Assert-Equal ($placeRes.id -ne $null) $true "Place created with ID: $($placeRes.id)"
Assert-Equal $placeRes.name "ঐতিহাসিক পুরনো জামে মসজিদ $randomId" "Place name verified"

Write-Host "`n=== TEST 4: Citizen Submits Complaint with Optional Image ===" -ForegroundColor Cyan
# Register citizen
$citizenPhone = ("016" + (Get-Random -Minimum 1000 -Maximum 9999) + "1234").Substring(0, 11)
$citizenBody = @{
    name = "করিম হোসেন"
    phoneNumber = $citizenPhone
