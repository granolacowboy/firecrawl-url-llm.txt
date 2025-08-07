import tkinter as tk
from tkinter import messagebox
import os

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("Firecrawl Configurator")

        self.env_vars = {
            "PORT": tk.StringVar(value="3002"),
            "OPENAI_API_KEY": tk.StringVar(),
            "PROXY_SERVER": tk.StringVar(),
            "PROXY_USERNAME": tk.StringVar(),
            "PROXY_PASSWORD": tk.StringVar(),
            "BULL_AUTH_KEY": tk.StringVar(value="CHANGEME"),
        }

        self.load_env()

        self.create_widgets()

    def load_env(self):
        try:
            with open("../../.env", "r") as f:
                for line in f:
                    if "=" in line:
                        key, value = line.strip().split("=", 1)
                        if key in self.env_vars:
                            self.env_vars[key].set(value)
        except FileNotFoundError:
            pass # .env file doesn't exist yet

    def save_env(self):
        try:
            with open("../../.env", "w") as f:
                for key, var in self.env_vars.items():
                    value = var.get()
                    if value:
                        f.write(f"{key}={value}\n")
            messagebox.showinfo("Success", ".env file saved successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save .env file: {e}")

    def create_widgets(self):
        frame = tk.Frame(self.root, padx=10, pady=10)
        frame.pack(fill="both", expand=True)

        row = 0
        for key, var in self.env_vars.items():
            label = tk.Label(frame, text=f"{key}:")
            label.grid(row=row, column=0, sticky="w", pady=5)
            entry = tk.Entry(frame, textvariable=var, width=50)
            entry.grid(row=row, column=1, sticky="ew", pady=5, padx=5)
            row += 1

        save_button = tk.Button(frame, text="Save Configuration", command=self.save_env)
        save_button.grid(row=row, column=0, columnspan=2, pady=10)

        # Docker controls
        docker_frame = tk.LabelFrame(self.root, text="Docker Controls", padx=10, pady=10)
        docker_frame.pack(fill="both", expand="yes", padx=10, pady=10)

        start_button = tk.Button(docker_frame, text="Start Firecrawl", command=self.start_docker)
        start_button.pack(side="left", padx=5)

        stop_button = tk.Button(docker_frame, text="Stop Firecrawl", command=self.stop_docker)
        stop_button.pack(side="left", padx=5)

        logs_button = tk.Button(docker_frame, text="View Logs", command=self.view_logs)
        logs_button.pack(side="left", padx=5)

        # Ingestion UI Button
        ingestion_ui_button = tk.Button(self.root, text="Open Ingestion UI", command=self.open_ingestion_ui)
        ingestion_ui_button.pack(pady=10)


    def open_ingestion_ui(self):
        import webbrowser
        webbrowser.open("http://localhost:3003")

    def start_docker(self):
        self.run_docker_command(["compose", "up", "-d", "--build"], "Starting Firecrawl...")

    def stop_docker(self):
        self.run_docker_command(["compose", "down"], "Stopping Firecrawl...")

    def view_logs(self):
        self.run_docker_command(["compose", "logs", "--follow"], "Docker Logs", show_logs=True)

    def run_docker_command(self, command, title, show_logs=False):
        try:
            import subprocess
            process = subprocess.Popen(
                ["docker"] + command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd="../.." # Run from the root of the project
            )

            if show_logs:
                self.show_log_window(process, title)
            else:
                stdout, stderr = process.communicate()
                if process.returncode == 0:
                    messagebox.showinfo("Success", f"{title} completed successfully.")
                else:
                    messagebox.showerror("Error", f"Failed to run command: docker {' '.join(command)}\n\n{stderr}")

        except FileNotFoundError:
            messagebox.showerror("Error", "Docker not found. Please make sure Docker is installed and in your PATH.")
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {e}")

    def show_log_window(self, process, title):
        log_window = tk.Toplevel(self.root)
        log_window.title(title)
        log_text = tk.Text(log_window, wrap="word", height=20, width=80)
        log_text.pack(fill="both", expand=True)

        def stream_logs():
            if process.stdout:
                for line in iter(process.stdout.readline, ''):
                    log_text.insert(tk.END, line)
                    log_text.see(tk.END)
                process.stdout.close()

        import threading
        thread = threading.Thread(target=stream_logs)
        thread.daemon = True
        thread.start()


if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()
