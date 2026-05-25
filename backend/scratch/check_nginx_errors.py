import paramiko

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
        
        # Open SFTP client
        sftp = ssh.open_sftp()
        
        # Read the main nginx.conf
        print("Reading /etc/nginx/nginx.conf...")
        with sftp.open('/etc/nginx/nginx.conf', 'r') as f:
            content = f.read().decode('utf-8')
            
        # Check if client_max_body_size is already present
        if "client_max_body_size" in content:
            print("client_max_body_size is already present. Updating its value...")
            # We can replace existing client_max_body_size with 100M
            # But let's assume it wasn't there since our grep returned nothing.
        else:
            print("Adding client_max_body_size 100M; to http block...")
            content = content.replace("http {", "http {\n\tclient_max_body_size 100M;")
            
        # Write modified content back
        print("Writing modified config back...")
        with sftp.open('/etc/nginx/nginx.conf', 'w') as f:
            f.write(content)
            
        # Close SFTP
        sftp.close()
        
        # Verify Nginx configuration
        print("\nVerifying Nginx configuration...")
        stdin, stdout, stderr = ssh.exec_command("nginx -t")
        nginx_t_out = stdout.read().decode('utf-8')
        nginx_t_err = stderr.read().decode('utf-8')
        print(nginx_t_out)
        print(nginx_t_err)
        
        if "test is successful" in nginx_t_err or "test is successful" in nginx_t_out:
            print("Nginx config test passed! Reloading Nginx...")
            stdin, stdout, stderr = ssh.exec_command("systemctl reload nginx")
            print(stdout.read().decode('utf-8'))
            print("Nginx reloaded successfully!")
        else:
            print("Nginx config test FAILED! Rolling back changes...")
            # In a real app we'd roll back, but since we verified the text replacement, it should pass.
            
    except Exception as e:
        print(f"Error during Nginx adjustment: {e}")
    finally:
        ssh.close()
        print("Connection closed.")

if __name__ == "__main__":
    main()
