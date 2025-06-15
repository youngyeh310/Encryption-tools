import fs from 'fs';
import crypto from 'crypto';
import chalk from 'chalk';
import readline from 'readline';

console.log(chalk.yellow('=== 批量私钥加密工具 (支持ETH/SOL) ==='));

// 创建 readline 接口用于用户输入密码
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 异步询问密码
async function askPassword(query) {
    return new Promise(resolve => {
        rl.question(query, answer => {
            resolve(answer);
        });
    });
}

// 验证 Base58 格式（Solana 私钥使用）
function isValidBase58(str) {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    return base58Regex.test(str);
}

// 验证私钥格式
function validatePrivateKey(privateKey) {
    const cleanedKey = privateKey.trim();
    
    // ETH 私钥验证 (64位十六进制，可选0x前缀)
    const ethKey = cleanedKey.startsWith('0x') ? cleanedKey.slice(2) : cleanedKey;
    if (/^[0-9a-fA-F]{64}$/.test(ethKey)) {
        return { valid: true, type: 'ETH', key: ethKey };
    }
    
    // SOL 私钥验证 (Base58编码，通常87-88个字符)
    if (cleanedKey.length >= 80 && cleanedKey.length <= 90 && isValidBase58(cleanedKey)) {
        return { valid: true, type: 'SOL', key: cleanedKey };
    }
    
    return { valid: false, type: 'UNKNOWN', key: cleanedKey };
}

// 使用 PBKDF2 从密码生成加密密钥
async function generateEncryptionKey() {
    const password = await askPassword(chalk.magenta('请输入加密密码（至少8个字符）: '));
    if (!password || password.length < 8) {
        console.log(chalk.red('❌ 密码必须至少8个字符'));
        rl.close();
        process.exit(1);
    }
    
    const salt = crypto.randomBytes(16); // 随机 16 字节盐
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256'); // PBKDF2 生成 32 字节密钥
    return { key: key.toString('hex'), salt: salt.toString('hex') };
}

// 处理私钥并更新 .env
async function encryptPrivateKeys() {
    const inputFile = 'privateKey.txt';
    const envFile = '.env';
    
    // 检查输入文件
    if (!fs.existsSync(inputFile)) {
        console.log(chalk.red(`❌ 输入文件 ${inputFile} 未找到`));
        rl.close();
        process.exit(1);
    }
    
    // 读取私钥
    const privateKeys = fs.readFileSync(inputFile, 'utf8')
        .split('\n')
        .map(key => key.trim())
        .filter(key => key.length > 0);
    
    if (privateKeys.length === 0) {
        console.log(chalk.red('❌ privateKey.txt 文件为空'));
        rl.close();
        process.exit(1);
    }
    
    // 生成加密密钥和盐
    const { key: encryptionKey, salt } = await generateEncryptionKey();
    
    // 存储 .env 内容
    const envContent = [`SALT=${salt}`];
    
    try {
        let validKeyCount = 0;
        
        // 处理所有私钥
        privateKeys.forEach((privateKey, index) => {
            const validation = validatePrivateKey(privateKey);
            
            if (!validation.valid) {
                console.log(chalk.red(`❌ 无效私钥格式: ${privateKey.slice(0, 10)}...${privateKey.slice(-10)}`));
                console.log(chalk.yellow('   支持格式: ETH (64位十六进制) 或 SOL (Base58编码)'));
                return;
            }
            
            // 加密私钥
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
            let encrypted = cipher.update(validation.key, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            // 保存到环境变量，包含类型信息
            envContent.push(`ENCRYPTED_KEY_${index}=${encrypted}:${iv.toString('hex')}:${validation.type}`);
            
            const displayKey = validation.key.length > 20 
                ? `${validation.key.slice(0, 10)}...${validation.key.slice(-10)}`
                : `${validation.key.slice(0, 6)}...${validation.key.slice(-6)}`;
            
            console.log(chalk.green(`✅ 成功加密 ${validation.type} 私钥 ${index}: ${displayKey}`));
            validKeyCount++;
        });
        
        if (validKeyCount === 0) {
            console.log(chalk.red('❌ 没有找到有效的私钥'));
            rl.close();
            process.exit(1);
        }
        
        // 清空并写入 .env
        fs.writeFileSync(envFile, envContent.join('\n'), 'utf8');
        console.log(chalk.green(`✅ 盐和 ${validKeyCount} 个加密私钥已保存到 ${envFile}`));
        
        console.log(chalk.yellow('\n已清空并更新 .env 文件，格式说明：'));
        console.log(chalk.cyan('ENCRYPTED_KEY_X=加密数据:IV:类型'));
        console.log(chalk.cyan('类型标识: ETH=以太坊私钥, SOL=Solana私钥\n'));
        
        // 显示统计信息
        const ethCount = envContent.filter(line => line.includes(':ETH')).length;
        const solCount = envContent.filter(line => line.includes(':SOL')).length;
        console.log(chalk.blue(`📊 加密统计: ETH私钥 ${ethCount} 个, SOL私钥 ${solCount} 个`));
        
    } catch (error) {
        console.log(chalk.red(`❌ 加密失败: ${error.message}`));
        rl.close();
        process.exit(1);
    } finally {
        rl.close();
    }
}

// 运行加密
encryptPrivateKeys();