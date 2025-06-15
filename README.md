# 🇺🇸 Encryption & Decryption Process

## 📖 Overview

This script uses **AES-256-CBC (Advanced Encryption Standard, 256-bit key, CBC mode)** as the core encryption algorithm to encrypt and decrypt private keys.
The encryption key (`ENCRYPTION_KEY`) is **neither directly stored nor randomly generated**, but derived from a user-provided password and a randomly generated salt using **PBKDF2 (Password-Based Key Derivation Function 2)**.

---

## ⚙️ Install Dependencies

Before using this project, install the required Node.js dependencies:
Run the following command to install all dependencies:

```bash
npm install
```

---

## 🚀 Usage

### 1️⃣ Encryption

```bash
node JM.js
```

* Prepare the `privateKey.txt` file (one private key per line).
* The program will prompt you to enter an encryption password.
* Encrypted private keys and the salt will be automatically saved to the `.env` file.

### 2️⃣ Decryption

```bash
node PJ.js
```

* The program reads the encrypted data from the `.env` file.
* Enter your password to decrypt.
* Successfully decrypted private keys will be displayed for wallet initialization.

---

## 🔒 Encryption Process

* Read private keys from `privateKey.txt`.
* Generate encryption key:

  * Prompt user to enter a password.
  * Use PBKDF2 (Password + Salt) to derive a 32-byte key.
* Encrypt each private key:

  * Output encoding: Hexadecimal.
  * Format: `<encrypted_hex>:<iv_hex>`
* Store encrypted data:

  * `SALT=<salt_hex>` saved to `.env`
  * `ENCRYPTED_KEY_<index>=<encrypted_hex>:<iv_hex>` saved to `.env`

---

## 🔓 Decryption Process (PJ.js)

* Read `SALT` and encrypted private keys from `.env`.
* Enter password (minimum 8 characters).
* Use PBKDF2 to derive encryption key (100,000 iterations, SHA-256).
* Decrypt using AES-256-CBC:

  * Extract `<encrypted_hex>` and `<iv_hex>`.
  * Output the decrypted private key.

---

## 📦 Summary

* AES-256-CBC encryption
* PBKDF2 key derivation
* Encrypted keys and salt stored in `.env` file
* Supports multi-key encryption and decryption
  
# 🇨🇳 加密和解密过程

## 📖 概述

此脚本使用 **AES-256-CBC（高级加密标准，256 位密钥，CBC 模式）** 作为核心加密算法来加密和解密私钥。
加密密钥（`ENCRYPTION_KEY`）**并非直接存储或随机生成**，而是使用 **PBKDF2（基于密码的密钥派生函数 2）**，由用户提供的密码和随机生成的盐值派生而来。

---

## ⚙️ 安装依赖

在使用前请先安装以下 Node.js 依赖：
通过 `npm install` 一键安装所有依赖：

```bash
npm install
```
---

## 🚀 使用方式

### 1️⃣ 加密

```bash
node JM.js
```

* 准备好 `privateKey.txt` 文件（每行一个私钥）。
* 程序会提示输入加密密码。
* 加密后的私钥与盐值会自动保存至 `.env` 文件中。

### 2️⃣ 解密

```bash
node PJ.js
```

* 程序从 `.env` 文件读取加密数据。
* 输入密码进行解密。
* 成功解密后输出原始私钥，供钱包初始化使用。

---

## 🔒 加密过程

* 从 `privateKey.txt` 读取私钥。
* 生成加密密钥：

  * 提示输入密码。
  * 使用 PBKDF2（密码 + 盐值）派生出 32 字节密钥。
* 加密每个私钥：

  * 输出编码：十六进制。
  * 格式：`<encrypted_hex>:<iv_hex>`
* 存储加密数据：

  * `SALT=<salt_hex>` 保存至 `.env`
  * `ENCRYPTED_KEY_<index>=<encrypted_hex>:<iv_hex>` 保存至 `.env`

---

## 🔓 解密过程 (PJ.js)

* 从 `.env` 读取 `SALT` 和加密私钥。
* 输入密码（最少 8 位字符）。
* 使用 PBKDF2 进行密钥派生（100,000 次迭代，SHA-256）。
* 使用 AES-256-CBC 解密：

  * 提取 `<encrypted_hex>` 和 `<iv_hex>`。
  * 成功输出私钥。

---

## 📦 总结

* AES-256-CBC 加密
* PBKDF2 密钥派生
* 加密密钥和盐值存储在 `.env` 文件中
* 支持多密钥加解密

