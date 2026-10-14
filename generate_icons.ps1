Add-Type -AssemblyName System.Drawing

$srcLogoPath = "D:\LeimarembiFoundation-MobileApplication\assets\images\leimarembi_official_logo.png"
if (-not (Test-Path $srcLogoPath)) {
    Write-Error "Source logo not found at $srcLogoPath"
    exit 1
}

$src = [System.Drawing.Image]::FromFile($srcLogoPath)
Write-Output "Loaded source logo: $($src.Width)x$($src.Height)"

function Generate-Image {
    param(
        [int]$CanvasW,
        [int]$CanvasH,
        [int]$LogoTargetH,
        [System.Drawing.Color]$BgColor,
        [bool]$IsRound = $false,
        [bool]$IsMonochrome = $false,
        [string]$OutputPath
    )

    $bmp = New-Object System.Drawing.Bitmap($CanvasW, $CanvasH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($BgColor -eq [System.Drawing.Color]::Transparent) {
        $g.Clear([System.Drawing.Color]::Transparent)
    } else {
        if ($IsRound) {
            $g.Clear([System.Drawing.Color]::Transparent)
            $brush = New-Object System.Drawing.SolidBrush($BgColor)
            $g.FillEllipse($brush, 0, 0, $CanvasW, $CanvasH)
            $brush.Dispose()
        } else {
            $g.Clear($BgColor)
        }
    }

    if ($LogoTargetH -gt 0) {
        $targetW = [int]($src.Width * ($LogoTargetH / $src.Height))
        $x = [int](($CanvasW - $targetW) / 2)
        $y = [int](($CanvasH - $LogoTargetH) / 2)

        if ($IsMonochrome) {
            # Render monochrome (dark silhouette with alpha)
            $ia = New-Object System.Drawing.Imaging.ImageAttributes
            $cm = New-Object System.Drawing.Imaging.ColorMatrix
            # Use color matrix to tint all colors to solid dark green/black while preserving alpha
            $cm.Matrix00 = 0.05; $cm.Matrix01 = 0.32; $cm.Matrix02 = 0.16; # R,G,B tint
            $cm.Matrix33 = 1.0; # Keep alpha
            $ia.SetColorMatrix($cm)
            $destRect = New-Object System.Drawing.Rectangle($x, $y, $targetW, $LogoTargetH)
            $g.DrawImage($src, $destRect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel, $ia)
            $ia.Dispose()
        } else {
            $g.DrawImage($src, $x, $y, $targetW, $LogoTargetH)
        }
    }

    # Ensure output directory exists
    $parentDir = Split-Path -Parent $OutputPath
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Created: $OutputPath ($CanvasW x $CanvasH)"
}

$densities = @(
    @{ Name = "mdpi";    AdaptW = 108; AdaptLogoH = 55;  LegacyW = 48;  LegacyLogoH = 36;  SplashW = 192; SplashLogoH = 120 },
    @{ Name = "hdpi";    AdaptW = 162; AdaptLogoH = 82;  LegacyW = 72;  LegacyLogoH = 54;  SplashW = 288; SplashLogoH = 180 },
    @{ Name = "xhdpi";   AdaptW = 216; AdaptLogoH = 110; LegacyW = 96;  LegacyLogoH = 72;  SplashW = 384; SplashLogoH = 240 },
    @{ Name = "xxhdpi";  AdaptW = 324; AdaptLogoH = 165; LegacyW = 144; LegacyLogoH = 108; SplashW = 576; SplashLogoH = 360 },
    @{ Name = "xxxhdpi"; AdaptW = 432; AdaptLogoH = 220; LegacyW = 192; LegacyLogoH = 144; SplashW = 768; SplashLogoH = 480 }
)

$resBase = "D:\LeimarembiFoundation-MobileApplication\android\app\src\main\res"

foreach ($d in $densities) {
    $mipDir = Join-Path $resBase ("mipmap-" + $d.Name)
    $drawDir = Join-Path $resBase ("drawable-" + $d.Name)

    # 1. Delete all legacy webp files in mipmap folder
    Get-ChildItem -Path $mipDir -Filter "*.webp" -ErrorAction SilentlyContinue | Remove-Item -Force

    # 2. Adaptive Foreground (Transparent bg, logo in safe zone)
    Generate-Image -CanvasW $d.AdaptW -CanvasH $d.AdaptW -LogoTargetH $d.AdaptLogoH -BgColor ([System.Drawing.Color]::Transparent) -OutputPath (Join-Path $mipDir "ic_launcher_foreground.png")

    # 3. Adaptive Background (Solid White #FFFFFF)
    Generate-Image -CanvasW $d.AdaptW -CanvasH $d.AdaptW -LogoTargetH 0 -BgColor ([System.Drawing.Color]::White) -OutputPath (Join-Path $mipDir "ic_launcher_background.png")

    # 4. Adaptive Monochrome (Themed icon support)
    Generate-Image -CanvasW $d.AdaptW -CanvasH $d.AdaptW -LogoTargetH $d.AdaptLogoH -BgColor ([System.Drawing.Color]::Transparent) -IsMonochrome $true -OutputPath (Join-Path $mipDir "ic_launcher_monochrome.png")

    # 5. Legacy Square Launcher (White background with centered logo)
    Generate-Image -CanvasW $d.LegacyW -CanvasH $d.LegacyW -LogoTargetH $d.LegacyLogoH -BgColor ([System.Drawing.Color]::White) -OutputPath (Join-Path $mipDir "ic_launcher.png")

    # 6. Legacy Round Launcher (White circular background with centered logo)
    Generate-Image -CanvasW $d.LegacyW -CanvasH $d.LegacyW -LogoTargetH $d.LegacyLogoH -BgColor ([System.Drawing.Color]::White) -IsRound $true -OutputPath (Join-Path $mipDir "ic_launcher_round.png")

    # 7. Splash Screen Logo
    Generate-Image -CanvasW $d.SplashW -CanvasH $d.SplashW -LogoTargetH $d.SplashLogoH -BgColor ([System.Drawing.Color]::Transparent) -OutputPath (Join-Path $drawDir "splashscreen_logo.png")
}

# Update Expo root assets as well
$assetsDir = "D:\LeimarembiFoundation-MobileApplication\assets\images"
Generate-Image -CanvasW 1024 -CanvasH 1024 -LogoTargetH 680 -BgColor ([System.Drawing.Color]::White) -OutputPath (Join-Path $assetsDir "icon.png")
Generate-Image -CanvasW 1024 -CanvasH 1024 -LogoTargetH 520 -BgColor ([System.Drawing.Color]::Transparent) -OutputPath (Join-Path $assetsDir "android-icon-foreground.png")
Generate-Image -CanvasW 1024 -CanvasH 1024 -LogoTargetH 0   -BgColor ([System.Drawing.Color]::White) -OutputPath (Join-Path $assetsDir "android-icon-background.png")
Generate-Image -CanvasW 1024 -CanvasH 1024 -LogoTargetH 520 -BgColor ([System.Drawing.Color]::Transparent) -IsMonochrome $true -OutputPath (Join-Path $assetsDir "android-icon-monochrome.png")
Generate-Image -CanvasW 1024 -CanvasH 1024 -LogoTargetH 600 -BgColor ([System.Drawing.Color]::Transparent) -OutputPath (Join-Path $assetsDir "splash-icon.png")

$src.Dispose()
Write-Output "All Android mipmap icons and Expo assets generated successfully!"
