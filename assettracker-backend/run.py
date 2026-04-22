import sys
import platform

# Patch platform to avoid ValueError: failed to parse CPython sys.version
def patched_sys_version():
    return ('CPython', '3.13.9', '3.13.9', '', '')
platform._sys_version = patched_sys_version
platform.python_version = lambda: '3.13.9'
platform.python_implementation = lambda: 'CPython'

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=10000, reload=True)
