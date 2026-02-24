param(
    [string]$NasHost = "192.168.68.100",
    [int]$NasPort = 10000,
    [string]$NasUser = "skyarcher",
    [string]$RemoteDir = "/data/kids_inspiration",
    [string]$ContainerName = "kids-inspiration",
    [int]$HostPort = 8080
)

$ErrorActionPreference = "Stop"

Write-Host "[1/5] Build dist ..."
npm run build

Write-Host "[2/5] Remove old container and clear remote dir ..."
ssh -p $NasPort "$NasUser@$NasHost" "sudo docker rm -f $ContainerName 2>/dev/null; sudo rm -rf ${RemoteDir}/*; sudo mkdir -p $RemoteDir; sudo chown -R ${NasUser}:${NasUser} $RemoteDir"

Write-Host "[3/5] Upload latest dist ..."
scp -P $NasPort -r "dist/*" "$NasUser@$NasHost`:$RemoteDir/"

Write-Host "[4/5] Fix permissions ..."
ssh -p $NasPort "$NasUser@$NasHost" "sudo chmod -R a+rX $RemoteDir"

Write-Host "[5/5] Start new nginx container ..."
ssh -p $NasPort "$NasUser@$NasHost" "sudo docker run -d --name $ContainerName --restart unless-stopped -p 0.0.0.0:$HostPort`:80 -v ${RemoteDir}:/usr/share/nginx/html:ro nginx:alpine; sudo docker ps --filter name=$ContainerName"

Write-Host "Deployment done: http://${NasHost}:${HostPort}/"
