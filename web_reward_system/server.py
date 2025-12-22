from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import os
import socket

class CORSHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def get_local_ip():
    """获取本地IP地址"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def run_server(port=8000):
    # 切换到HTML文件所在目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server_address = ('', port)
    httpd = HTTPServer(server_address, CORSHandler)
    
    local_ip = get_local_ip()
    print(f"🎮 学习小超人已启动!")
    print(f"📱 在平板上访问: http://{local_ip}:{port}")
    print(f"💻 在电脑上访问: http://localhost:{port}")
    
    # 自动打开浏览器
    webbrowser.open(f'http://localhost:{port}')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 服务已停止")

if __name__ == '__main__':
    run_server(8000)
