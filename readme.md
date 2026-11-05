# Hypeddit & Fangate DownloadWallBypasser (Reloaded)

[![Install Userscript](https://img.shields.io/badge/Tampermonkey-Install%20Script-success?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/frandj99/Downloadwall-bypasser-Frandj/master/script.user.js)
[![GitHub release](https://img.shields.io/badge/Release-2026.11.05-blue?style=for-the-badge)](https://github.com/frandj99/Downloadwall-bypasser-Frandj)

An automated userscript to bypass music download fangates across **Hypeddit**, **PumpYourSound**, and **Droploud**. It handles mandatory social actions, authorization popups, comments, and form steps automatically so you can grab track downloads without friction.

---

## 🚀 One-Click Install & Auto-Updates

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/) (recommended) or Violentmonkey.
2. Click the install badge or direct link below:
   👉 **[Click here to Install / Update Userscript](https://raw.githubusercontent.com/frandj99/Downloadwall-bypasser-Frandj/master/script.user.js)**
3. Tampermonkey will prompt you to install. Click **Install**.
4. **Automatic Updates**: This script contains `@updateURL` and `@downloadURL` tags configured to this repository. Tampermonkey will check for updates automatically and keep your script current.

---

## ⚙️ Easy Settings Configuration

You **do not** need to edit the script file to set your email address or comments. 

Simply click the **Tampermonkey icon** in your browser toolbar while on any supported page, and select:
* **`⚙️ Set Email Address`**: Enter your custom email address (saved persistently across script updates).
* **`⚙️ Set Name`**: Enter your preferred display name.
* **`⚙️ Set SoundCloud Comment`**: Customize the comment posted on SoundCloud gates (default: `"Woow! Thanks bro"`).

Your settings are stored securely inside Tampermonkey storage (`GM_setValue`) and will never be overwritten when the script auto-updates!

---

## ⚡ Supported Platforms & Features

### 1. **Droploud** (`droploud.com`)
* **Email & Terms**: Automatically enters your email and checks required consent checkboxes.
* **Instagram Follows**: Clicks gate requirements and auto-closes temporary Instagram popup tabs after 2.5 seconds.
* **SoundCloud Flow**: Automatically inputs your comment with realistic React typing emulation, handles account OAuth connections, automatically reposts the required track to your SoundCloud profile, and verifies the repost/reshare so the gate proceeds seamlessly.
* **Spotify Step**: Automatically connects and authorizes required Spotify follow steps.
* **Download Unlock**: Clicks the final direct download button immediately once the gate finishes.

### 2. **Hypeddit** (`hypeddit.com`)
* Automates Multi-Portal gates (`Spotify`, `SoundCloud`, `Instagram`, `Email`, `YouTube`, `TikTok`, `Facebook`, `Mixcloud`, `Bandcamp`).
* Bypasses manual channel follow checks by automatically clearing undone states and advancing to the download screen.
* Auto-submits email forms with your configured credentials.

### 3. **PumpYourSound** (`pumpyoursound.com`)
* Auto-connects SoundCloud SDK.
* Posts automated track comments and verifies reposts/likes via background API requests.
* Handles external social steps and submits the free download form.

---

## 💡 Tips & Prerequisites

* **SoundCloud & Spotify Logins**: Make sure you are logged into your SoundCloud and Spotify accounts in your browser so OAuth / connect requests complete seamlessly.
* **Dummy Accounts**: Using secondary or "dummy" accounts for music fangates is recommended to keep your personal feeds and playlists clean.

---

## 📜 Credits & License

* Originally based on [hypeddit-downloadwall-bypasser-reloaded](https://github.com/fan1200/hypeddit-downloadwall-bypasser-reloaded) by **fan1200**.
* Maintained and enhanced by **frandj99**.
