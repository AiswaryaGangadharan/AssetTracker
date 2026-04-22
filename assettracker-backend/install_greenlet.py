import sys
import platform

def patched_sys_version():
    return ('CPython', '3.13.9', '3.13.9', '', '')
platform._sys_version = patched_sys_version
platform.python_version = lambda: '3.13.9'
platform.python_implementation = lambda: 'CPython'

from pip._internal.cli.main import main
if __name__ == "__main__":
    sys.exit(main(['install', 'greenlet']))
