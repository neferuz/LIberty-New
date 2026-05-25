import paramiko

def execute_command_realtime(ssh, command):
    print(f"\nRunning command: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    
    # Read output line by line in real-time
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line, end="")
        
    # Read any errors
    err = stderr.read().decode('utf-8')
    if err:
        print("\n--- Standard Error ---")
        print(err)
        
    # Get exit status
    exit_status = stdout.channel.recv_exit_status()
    print(f"Command finished with exit code: {exit_status}")
    return exit_status

def main():
    hostname = "147.45.155.163"
    username = "root"
    password = "nE315uSK*?t#DQ"
    
    print(f"Connecting to SSH server {hostname}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(hostname, username=username, password=password, timeout=15)
        print("Connected successfully!\n")
        
        # 1. Create a safe backup directory on the server outside the repository
        print("Creating backup of database and orders on the server...")
        execute_command_realtime(ssh, "mkdir -p /root/liberty_backup")
        
        # 2. Copy current liberty_wear.db and orders_db.json to backup dir
        execute_command_realtime(ssh, "cp /root/liberty-wear/backend/liberty_wear.db /root/liberty_backup/liberty_wear.db.backup")
        execute_command_realtime(ssh, "[ -f /root/liberty-wear/backend/orders_db.json ] && cp /root/liberty-wear/backend/orders_db.json /root/liberty_backup/orders_db.json.backup || echo 'No orders_db.json to backup'")
        
        # 3. Clean up the tracked database and orders in repository to allow git pull without conflicts
        # We will use git rm --cached if they are tracked, or checkout them.
        # The easiest way: git stash --include-untracked, or simply checkout lock files and temporarily move db files out of the way.
        print("\nTemporarily moving database files out of git directory to allow git pull...")
        execute_command_realtime(ssh, "rm -f /root/liberty-wear/backend/liberty_wear.db")
        execute_command_realtime(ssh, "rm -f /root/liberty-wear/backend/orders_db.json")
        
        # Reset package-lock.json files
        execute_command_realtime(ssh, "cd /root/liberty-wear && git checkout -- admin/package-lock.json frontend/package-lock.json")
        
        # 4. Pull latest code from GitHub
        cmd_pull = "cd /root/liberty-wear && git pull origin main"
        status = execute_command_realtime(ssh, cmd_pull)
        if status != 0:
            print("Failed to pull from git. Restoring backup database and aborting.")
            execute_command_realtime(ssh, "cp /root/liberty_backup/liberty_wear.db.backup /root/liberty-wear/backend/liberty_wear.db")
            execute_command_realtime(ssh, "[ -f /root/liberty_backup/orders_db.json.backup ] && cp /root/liberty_backup/orders_db.json.backup /root/liberty-wear/backend/orders_db.json || true")
            return

        # 5. Restore the database and orders from the backup folder
        print("\nRestoring database and orders files from backup folder...")
        execute_command_realtime(ssh, "cp /root/liberty_backup/liberty_wear.db.backup /root/liberty-wear/backend/liberty_wear.db")
        execute_command_realtime(ssh, "[ -f /root/liberty_backup/orders_db.json.backup ] && cp /root/liberty_backup/orders_db.json.backup /root/liberty-wear/backend/orders_db.json || true")

        # 6. Run clean up of deleted products on database on the server
        print("\nCleaning up deleted products from the database on server...")
        cmd_cleanup = "cd /root/liberty-wear/backend && ./venv/bin/python scripts/cleanup_deleted_products.py"
        execute_command_realtime(ssh, cmd_cleanup)
        
        # 7. Restart Backend via PM2
        print("\nRestarting Backend API...")
        execute_command_realtime(ssh, "pm2 restart liberty-backend")
        
        # 8. Build and Restart Admin Panel
        print("\nBuilding and Restarting Admin Panel...")
        cmd_build_admin = "cd /root/liberty-wear/admin && npm run build"
        admin_build_status = execute_command_realtime(ssh, cmd_build_admin)
        if admin_build_status == 0:
            execute_command_realtime(ssh, "pm2 restart liberty-admin")
        else:
            print("Admin Panel build failed! Skipping restart.")
            
        # 9. Build and Restart Frontend
        print("\nBuilding and Restarting Frontend...")
        cmd_build_frontend = "cd /root/liberty-wear/frontend && npm run build"
        frontend_build_status = execute_command_realtime(ssh, cmd_build_frontend)
        if frontend_build_status == 0:
            execute_command_realtime(ssh, "pm2 restart liberty-frontend")
        else:
            print("Frontend build failed! Skipping restart.")
            
        # 10. Show final PM2 status
        print("\n=================== FINAL STATUS ===================")
        execute_command_realtime(ssh, "pm2 list")
        
    except Exception as e:
        print(f"Error during deployment: {e}")
    finally:
        ssh.close()
        print("\nConnection closed.")

if __name__ == "__main__":
    main()
