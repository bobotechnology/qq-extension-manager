# QQ Extension Manager  

#### Lightweight · Simple · Open Source · Furry  

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![GitHub release](https://img.shields.io/github/v/release/bobotechnology/qq-extension-manager?logo=github)](https://github.com/bobotechnology/qq-extension-manager/releases)  

[简体中文](https://github.com/bobotechnology/qq-extension-manager/blob/main/README.md) | **English**

QQ Extension Manager is a plugin manager for QQNT, often referred to simply as QQExtension within the QQNT environment.  
It allows you to freely add various plugins to QQNT, enabling features such as theme customization, functionality enhancements, and more.  

⚠ **Warning**: QQ Security Center may flag QQ Extension Manager as third-party software and restrict your device access, or even result in account suspension. It is recommended to use a secondary account when installing QQ Extension Manager (some users have already received warnings from QQ Security).  
Please use QQ Extension Manager with caution.  

For more details, visit: [https://github.com/bobotechnology/qq-extension-manager](https://github.com/bobotechnology/qq-extension-manager)  

# Installation  

⚠️ This documentation is written for QQ Extension Manager 1.3.0. Currently, it only supports Windows 64-bit and requires an unreleased `dbghelp.dll` from the Telegram channel.  

### Download QQ Extension Manager  
First, download QQ Extension Manager to any location. There are two methods:  

- **Release (Stable Version)**: Go to the [QQ Extension Manager Releases page](https://github.com/bobotechnology/qq-extension-manager/releases), download the `qq-extension-manager.zip` file, and extract it to any location.  

- **Clone (Latest Commit)**: Use Git to clone the QQ Extension Manager repository locally.

  ```bash
  git clone --depth 1 https://github.com/bobotechnology/qq-extension-manager.git
  ```  

### Bypassing QQNT File Verification on Windows  
Download the `dbghelp_*.dll` file from the Telegram group according to your system architecture, rename it to `dbghelp.dll`, and place it in the same directory as `QQ.exe`.  

### Verifying Installation  
After completing the installation steps, there are two ways to check if QQ Extension Manager was installed successfully:  

- Launch QQNT, open Settings, and check if the QQ Extension Manager option appears in the left sidebar.  
- Run QQNT via the terminal and check if QQ Extension Manager-related output is displayed.  

If either condition is met, the installation was successful. Enjoy!  

# Plugins  

### Standard Installation  
You can install/uninstall plugins directly in the Settings interface. Alternatively, use community-developed plugin market plugins for management.  

### Manual Installation  
Move the plugin folder to `QQExtensionManager/plugins` to install it. To uninstall, delete the corresponding folder from the `plugins` directory (plugin data is stored in the `data` directory under the same name).  

### Finding Plugins  
You can discover plugins through:  
- The official website homepage  
- Third-party plugin markets  
- GitHub searches  

An official [plugin list](https://github.com/bobotechnology/qq-extension-manager/discussions) is maintained, cataloging most known plugins.  

# Development  
Refer to the [official documentation](https://github.com/bobotechnology/qq-extension-manager/wiki) for details.  

# License
QQ Extension Manager is open-sourced under the MIT License.  

```  
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS  
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR  
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER  
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN  
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.  
```