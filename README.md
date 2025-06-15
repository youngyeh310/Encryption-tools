## Encryption & Decryption Process
### Overview

This script uses **AES-256-CBC (Advanced Encryption Standard, 256-bit key, CBC mode)** as the core encryption algorithm to encrypt and decrypt private keys.
The encryption key (`ENCRYPTION_KEY`) is **not directly stored or randomly generated**, but is derived from a user-provided password and a randomly generated salt using **PBKDF2 (Password-Based Key Derivation Function 2)**.

---

### 1. Encryption Process

* Read private keys from `privateKey.txt`.
* Generate encryption key:

  * Prompt user to enter a password.
  * Use PBKDF2 (Password + Salt) to derive a 32-byte key.
* Encrypt each private key:

  * Output encoding: Hexadecimal.
  * Encrypted result format:

    ```
    <encrypted_hex>:<iv_hex>
    ```
* Store encryption data:

  * Save salt to `.env` file as:

    ```
    SALT=<salt_hex>
    ```
  * Save each encrypted private key to `.env` file as:

    ```
    ENCRYPTED_KEY_<index>=<encrypted_hex>:<iv_hex>
    ```

---

### 2. Decryption Process (PJ.js)

#### Step 1: Read `.env` file

* Load `SALT` and all `ENCRYPTED_KEY_<index>` entries from `.env`.

#### Step 2: Generate decryption key

* Prompt user to enter password (minimum 8 characters).
* Convert `SALT` from hex to Buffer.
* Generate 32-byte encryption key using PBKDF2 with:

  * Password + Salt
  * 100,000 iterations
  * SHA-256 hash function

#### Step 3: Decrypt private keys

* For each `ENCRYPTED_KEY_<index>`:

  * Extract `<encrypted_hex>` and `<iv_hex>` (split by `:`).
  * Decrypt using AES-256-CBC:

    * Key: derived by PBKDF2
    * IV: Buffer converted from `<iv_hex>`
  * Input encoding: Hexadecimal (cipher text).
  * Output encoding: UTF-8 (decrypted private key string).
  * Verify decryption result is a 64-character hexadecimal string (optionally prefixed with `0x`).

#### Step 4: Return private keys

* Return all successfully decrypted private keys for wallet initialization.

---

## Summary

* 🔐 AES-256-CBC encryption
* 🔑 PBKDF2 key derivation
* 🗄 Encrypted keys and salt stored in `.env` file
* 🔓 Supports multi-key encryption & decryption


## 加密和解密过程
### 概述

此脚本使用**AES-256-CBC（高级加密标准，256 位密钥，CBC 模式）**作为核心加密算法来加密和解密私钥。
加密密钥（`ENCRYPTION_KEY`）**并非直接存储或随机生成**，而是使用**PBKDF2（基于密码的密钥派生函数 2）**，由用户提供的密码和随机生成的盐值派生而来。

---

### 1. 加密过程

* 从 `privateKey.txt` 读取私钥。
* 生成加密密钥：

* 提示用户输入密码。
* 使用 PBKDF2（密码 + 盐值）算法派生出 32 字节密钥。
* 加密每个私钥：

* 输出编码：十六进制。
* 加密结果格式：

```
<encrypted_hex>:<iv_hex>
```
* 存储加密数据：

* 将 salt 保存到 `.env` 文件，格式如下：

```
SALT=<salt_hex>
```
* 将每个加密私钥保存到 `.env` 文件，格式如下：

```
ENCRYPTED_KEY_<index>=<encrypted_hex>:<iv_hex>
```

---

### 2. 解密过程 (PJ.js)

#### 步骤 1：读取 `.env` 文件

* 从 `.env` 文件中加载 `SALT` 和所有 `ENCRYPTED_KEY_<index>` 条目。

#### 步骤 2：生成解密密钥

* 提示用户输入密码（至少 8 个字符）。
* 将 `SALT` 从十六进制转换为缓冲区。
* 使用 PBKDF2 生成 32 字节加密密钥，密钥格式如下：

* 密码 + 盐值
* 100,000 次迭代
* SHA-256 哈希函数

#### 步骤 3：解密私钥

* 对于每个 `ENCRYPTED_KEY_<index>`：

* 提取 `<encrypted_hex>` 和 `<iv_hex>`（用 `:` 分隔）。
* 使用 AES-256-CBC 解密：

* 密钥：由 PBKDF2 生成
* IV：从 `<iv_hex>` 转换而来的缓冲区
* 输入编码：十六进制（密文）。
* 输出编码：UTF-8（解密后的私钥字符串）。
* 验证解密结果是否为 64 个字符的十六进制字符串（可选以 `0x` 为前缀）。

#### 步骤 4：返回私钥

* 返回所有成功解密的私钥，用于钱包初始化。

---

＃＃ 概括

* 🔐 AES-256-CBC 加密
* 🔑 PBKDF2 密钥派生
* 🗄 加密密钥和盐存储在 `.env` 文件中
* 🔓支持多密钥加解密


