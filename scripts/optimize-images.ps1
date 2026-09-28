$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$jpeg=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$items=Get-Content -Raw scripts\image-sources.json | ConvertFrom-Json
foreach($item in $items){
 $source=[System.Drawing.Image]::FromFile($item.path)
 $sizes=@([int]$source.Width)
 if($item.responsive){$sizes+=640}
 foreach($width in $sizes){
  $height=[int][Math]::Round($source.Height*$width/$source.Width)
  $bmp=New-Object System.Drawing.Bitmap($width,$height)
  $g=[System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($source,0,0,$width,$height)
  $params=New-Object System.Drawing.Imaging.EncoderParameters(1)
  $params.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[long]88)
  $suffix=if($width -eq 640){'-sm'}else{''}
  $dest=Join-Path (Get-Location) ('assets\images\'+$item.name+$suffix+'.jpg')
  $bmp.Save($dest,$jpeg,$params)
  $g.Dispose();$bmp.Dispose();$params.Dispose()
 }
 $source.Dispose()
}
