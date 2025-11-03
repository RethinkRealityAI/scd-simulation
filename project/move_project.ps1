# PowerShell script to move project contents to scd-simulation/
# This script copies the content to a new folder and updates git.
# It does not delete the original 'project' folder to avoid file-locking issues.

$sourceDir = "."
$targetDir = "../scd-simulation" # Move to a sibling directory

if (Test-Path $targetDir) {
    Write-Error "$targetDir already exists. Please remove it and try again."
    exit 1
}

Write-Output "Creating target directory: $targetDir"
mkdir $targetDir

# Use robocopy to copy all contents
Write-Output "Copying files from $sourceDir to $targetDir..."
robocopy $sourceDir $targetDir /E /COPY:DAT /DCOPY:T /XF "move_project.ps1" "robocopy.log" /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) {
    Write-Error "robocopy failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
}

# Change directory and update git
Push-Location $targetDir

# If inside a git repo, update the index
if (git rev-parse --is-inside-work-tree 2>$null) {
    Write-Output "Updating git index..."
    git add -A
    git commit -m "feat: Relocate project files to scd-simulation directory"
    Write-Output "Git commit created for the move."
}

Pop-Location

Write-Output "Files copied and git history updated."
Write-Output "----------------------------------------------------------------"
Write-Output "ACTION REQUIRED:"
Write-Output "The original 'project' directory has NOT been deleted."
Write-Output "Please manually delete the 'project' directory after closing any programs using it."
Write-Output "----------------------------------------------------------------"