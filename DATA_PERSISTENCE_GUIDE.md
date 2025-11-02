# Data Persistence and Backup Guide

This guide explains the automated data persistence and backup systems in place to ensure data is never lost, even when containers are rebuilt.

## 🔄 Data Persistence Strategy

### Docker Volume Persistence

The database data is stored in a Docker volume named `pilzno_crm_pilzno-synagogue-db-data`:

- **Location**: Managed by Docker Desktop
- **Persistence**: Volume persists even when containers are stopped/removed
- **Rebuild Safety**: Data remains safe during container rebuilds

### Volume Configuration

In `docker-compose.yml`:
```yaml
volumes:
  pilzno-synagogue-db-data:
    driver: local
```

The database container mounts this volume:
```yaml
volumes:
  - pilzno-synagogue-db-data:/var/lib/postgresql/data
```

## 💾 Automated Backup System

### Backup Scripts

Two backup scripts are provided for different platforms:

1. **Linux/Mac/Git Bash**: `scripts/automated-db-backup.sh`
2. **Windows**: `scripts/automated-db-backup.bat`

### Backup Features

- ✅ Automatic database backup creation
- ✅ Timestamped backup files
- ✅ Compression to save disk space
- ✅ Automatic cleanup (keeps last 30 backups)
- ✅ Latest backup symlink for easy access
- ✅ Health checks before backup
- ✅ Container auto-start if not running

### Backup Location

Backups are stored in: `backups/database/`

Format: `database_backup_YYYYMMDD_HHMMSS.sql.gz`

### Running Manual Backups

**Git Bash:**
```bash
cd scripts
chmod +x automated-db-backup.sh
./automated-db-backup.sh
```

**Windows:**
```batch
cd scripts
automated-db-backup.bat
```

### Automated Scheduling

#### Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 2 AM)
4. Action: Start a program
5. Program: `C:\path\to\pilzno_crm\scripts\automated-db-backup.bat`
6. Start in: `C:\path\to\pilzno_crm`

#### Linux Cron (for Git Bash/WSL)

Add to crontab (`crontab -e`):
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/pilzno_crm/scripts/automated-db-backup.sh >> /path/to/pilzno_crm/logs/backup.log 2>&1
```

#### Docker Compose with Cron Container (Alternative)

You can add a cron container to docker-compose.yml:
```yaml
services:
  backup-cron:
    image: alpine:latest
    volumes:
      - ./scripts:/scripts
      - ./backups:/backups
    command: >
      sh -c "
        apk add --no-cache dcron &&
        echo '0 2 * * * /scripts/automated-db-backup.sh' | crontab - &&
        crond -f -l 2
      "
    depends_on:
      - pilzno-synagogue-db
```

### Restoring from Backup

**From SQL backup:**
```bash
cd "Pilzno/pilzno_crm"
Get-Content "backups/database/database_backup_YYYYMMDD_HHMMSS.sql.gz" | gunzip | docker exec -i pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue
```

**From latest backup:**
```bash
Get-Content "backups/database/database_backup_latest.sql.gz" | gunzip | docker exec -i pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue
```

## 📅 Hebrew Date Persistence

### Critical Rules

1. **When CREATING new records**: Calculate Hebrew date from English date
2. **When EDITING existing records**: Use STORED Hebrew date, NEVER recalculate
3. **Dates are IMMUTABLE**: They only change when the user explicitly updates them

### Implementation

The system stores both dates separately in the database:

- `dateOfBirth` (Gregorian date)
- `hebrewBirthDate` (Hebrew date string)

When editing, the form uses `loadStoredDatePair()` which:
- ✅ Uses the stored Hebrew date from the database
- ✅ Does NOT recalculate from Gregorian date
- ✅ Prevents date shifts during editing

### Date Conversion Utility

Located in: `frontend/src/utils/datePersistence.ts`

**Functions:**
- `convertToHebrewDate()` - For NEW entries only
- `loadStoredDatePair()` - For EXISTING entries (uses stored dates)
- `validateDatePair()` - For debugging date drift issues

### Preventing Date Shifts

The form component (`FamilyMemberFormDialog.tsx`) now:
1. Checks for stored Hebrew date when editing
2. Uses stored date instead of recalculating
3. Only calculates if Hebrew date is missing (backwards compatibility)

**Code pattern:**
```typescript
// When editing existing member
if (member.hebrewBirthDate) {
  // Use stored Hebrew date (prevents drift)
  setHebrewDate(member.hebrewBirthDate)
} else {
  // Only calculate if missing (new records)
  const datePair = convertToHebrewDate(dateOfBirth)
  setHebrewDate(datePair.hebrewDate)
}
```

## 🛡️ Data Safety Checklist

### Before Rebuilding Containers

- ✅ Run manual backup: `./scripts/automated-db-backup.sh`
- ✅ Verify backup file exists in `backups/database/`
- ✅ Check backup file size is reasonable (> 0 KB)

### After Rebuilding Containers

- ✅ Verify database volume is still mounted
- ✅ Check data exists: `docker exec pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue -c "SELECT COUNT(*) FROM families;"`
- ✅ Test application loads data correctly

### Regular Maintenance

- ✅ Verify automated backups are running (check `backups/database/` directory)
- ✅ Monitor disk space (backups are cleaned automatically, keeping last 30)
- ✅ Test restore process periodically

## 🚨 Troubleshooting

### Data Lost After Rebuild

1. **Check if volume still exists:**
   ```bash
   docker volume ls | grep pilzno-synagogue-db-data
   ```

2. **Restore from backup:**
   ```bash
   # Find latest backup
   ls -lt backups/database/ | head -5
   
   # Restore
   gunzip < backups/database/database_backup_YYYYMMDD_HHMMSS.sql.gz | docker exec -i pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue
   ```

### Date Shifts Occurring

1. **Check if stored Hebrew dates exist:**
   ```bash
   docker exec pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue -c "SELECT firstName, lastName, \"hebrewBirthDate\" FROM family_members WHERE \"hebrewBirthDate\" IS NOT NULL LIMIT 5;"
   ```

2. **Verify form is using stored dates:**
   - Open browser console when editing a member
   - Look for log: "✅ Using stored Hebrew date to prevent drift"

3. **Validate dates manually:**
   - Check if stored Hebrew dates match calculated dates
   - Use `validateDatePair()` function for debugging

### Backup Script Fails

1. **Check Docker is running:**
   ```bash
   docker ps
   ```

2. **Check database container is healthy:**
   ```bash
   docker exec pilzno-synagogue-db pg_isready -U synagogue_admin -d pilzno_synagogue
   ```

3. **Check permissions:**
   - Ensure `backups/database/` directory exists and is writable
   - On Windows, run script as Administrator if needed

## 📊 Backup Monitoring

### Check Backup Status

```bash
# List recent backups
ls -lt backups/database/ | head -10

# Check latest backup size
ls -lh backups/database/database_backup_latest.sql*

# Verify backup integrity
gunzip -t backups/database/database_backup_latest.sql.gz
```

### Backup Retention

- **Current**: Keeps last 30 backups automatically
- **Location**: `backups/database/`
- **Cleanup**: Runs automatically after each backup

To change retention, edit backup scripts:
```bash
# In automated-db-backup.sh, change this line:
ls -t database_backup_*.sql* 2>/dev/null | tail -n +31 | xargs -r rm -f
# Change +31 to desired number (e.g., +61 for 60 backups)
```

---

**Last Updated**: November 2, 2025  
**Maintained by**: Pilzno CRM Development Team

