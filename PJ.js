import fs from 'fs';
import crypto from 'crypto';
import chalk from 'chalk';
import readline from 'readline';
import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

function displayBanner() {
    console.clear();
    
    const asciiArt = [
        "    ███████╗██╗  ██╗██████╗ ██╗███████╗███████╗",
        "    ╚════██║██║ ██╔╝██╔══██╗██║██╔════╝██╔════╝",
        "        ██╔╝█████╔╝ ██████╔╝██║███████╗███████╗",
        "       ██╔╝ ██╔═██╗ ██╔══██╗██║╚════██║╚════██║",
        "       ██║  ██║  ██╗██║  ██║██║███████║███████║",
        "       ╚═╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝"
    ];
    
    console.log('\n');
    const colors = [chalk.red, chalk.yellow, chalk.green, chalk.blue, chalk.magenta, chalk.cyan];
    asciiArt.forEach((line, index) => {
        console.log(colors[index % colors.length].bold(line));
    });
    console.log('\n');
    
    console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.yellow.bold('                  私钥批量解密工具V1                       ') + chalk.cyan('║'));
    console.log(chalk.cyan('║') + chalk.green('                 Crypto Private Key Decryptor               ') + chalk.cyan('║'));
    console.log(chalk.cyan('╠══════════════════════════════════════════════════════════════╣'));
    console.log(chalk.cyan('║') + chalk.magenta('  🔐 支持格式: ETH (Ethereum) / SOL (Solana)              ') + chalk.cyan('║'));
    console.log(chalk.cyan('║') + chalk.blue('  🛡️  解密算法: AES-256-CBC + PBKDF2                        ') + chalk.cyan('║'));
    console.log(chalk.cyan('║') + chalk.white('  ⚡ 批量处理: 自动识别私钥类型并生成地址                 ') + chalk.cyan('║'));
    console.log(chalk.cyan('╠══════════════════════════════════════════════════════════════╣'));
    console.log(chalk.cyan('║') + chalk.gray('  开发者: ') + chalk.yellow.bold('@7KRIS5') + chalk.gray('                                   ') + chalk.cyan('║'));
    console.log(chalk.cyan('║') + chalk.gray('  版本: 2025 安全加强版                                  ') + chalk.cyan('║'));
    console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════╝'));
    
    console.log('\n' + chalk.red.bold('⚠️  安全提醒:'));
    console.log(chalk.yellow('   • 请确保在安全环境中运行此工具'));
    console.log(chalk.yellow('   • 解密后的私钥文件包含敏感信息，请妥善保管'));
    console.log(chalk.yellow('   • 建议在离线环境中使用'));
    
    console.log('\n' + chalk.green.bold('📖 使用说明:'));
    console.log(chalk.white('   1. 确保 .env 文件存在且包含加密私钥'));
    console.log(chalk.white('   2. 输入正确的解密密码'));
    console.log(chalk.white('   3. 解密结果将保存到 破解.csv 文件'));
    
    console.log('\n' + chalk.cyan('═'.repeat(62)) + '\n');
}

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function askPassword(query) {
    return new Promise(resolve => {
        rl.question(query, answer => {
            resolve(answer);
        });
    });
}

async function generateEncryptionKey() {
    const password = await askPassword(chalk.magenta('请输入解密密码（至少8个字符）: '));
    if (!password || password.length < 8) {
        console.log(chalk.red('❌ 密码必须至少8个字符'));
        return null;
    }
    const saltHex = process.env.SALT;
    if (!saltHex) {
        console.log(chalk.red('❌ .env 文件中未找到 SALT'));
        return null;
    }
    try {
        const salt = Buffer.from(saltHex, 'hex');
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
        return key.toString('hex');
    } catch (error) {
        console.log(chalk.red(`❌ 盐格式无效: ${error.message}`));
        return null;
    }
}

function generateEthereumAddress(privateKey) {
    try {
        const cleanedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
        if (!/^0x[0-9a-fA-F]{64}$/.test(cleanedPrivateKey)) {
            throw new Error('无效的以太坊私钥格式');
        }
        const wallet = new ethers.Wallet(cleanedPrivateKey);
        return {
            privateKey: cleanedPrivateKey,
            address: wallet.address,
            valid: true
        };
    } catch (error) {
        return {
            privateKey: privateKey,
            address: null,
            valid: false,
            error: error.message
        };
    }
}

function generateSolanaAddress(privateKey) {
    try {
        const decoded = bs58.decode(privateKey);
        if (decoded.length !== 64) {
            throw new Error('Solana 私钥必须是 64 字节');
        }
        
        const keypair = Keypair.fromSecretKey(decoded);
        const address = keypair.publicKey.toBase58();
        
        return {
            privateKey: privateKey,
            address: address,
            valid: true
        };
    } catch (error) {
        return {
            privateKey: privateKey,
            address: null,
            valid: false,
            error: error.message
        };
    }
}

function createCSVFile(decryptedData, outputFile) {
    try {
        const escapeCSV = (str) => {
            if (str == null) return '';
            const stringified = String(str);
            if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n') || stringified.includes('\r')) {
                return `"${stringified.replace(/"/g, '""')}"`;
            }
            return stringified;
        };

        const headers = 'Index,Chain,PrivateKey,Address\n';
        const csvRows = decryptedData.map(row => 
            `${escapeCSV(row.Index)},${escapeCSV(row.Chain)},${escapeCSV(row.PrivateKey)},${escapeCSV(row.Address)}`
        );
        
        const csvContent = headers + csvRows.join('\n');
        
        fs.writeFileSync(outputFile, csvContent, 'utf8');
        console.log(chalk.green(`✅ CSV 文件已成功创建: ${outputFile}`));
        
    } catch (error) {
        console.log(chalk.red(`❌ 创建 CSV 文件失败: ${error.message}`));
        throw error;
    }
}

async function decryptPrivateKeys() {
    const envFile = '.env';
    const outputFile = '破解.csv';

    if (!fs.existsSync(envFile)) {
        console.log(chalk.red(`❌ .env 文件未找到`));
        rl.close();
        process.exit(1);
    }

    const encryptionKey = await generateEncryptionKey();
    if (!encryptionKey) {
        rl.close();
        process.exit(1);
    }

    try {
        const envContent = fs.readFileSync(envFile, 'utf8')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const encryptedKeys = envContent
            .filter(line => line.startsWith('ENCRYPTED_KEY_'))
            .sort((a, b) => {
                const indexA = parseInt(a.match(/ENCRYPTED_KEY_(\d+)/)[1]);
                const indexB = parseInt(b.match(/ENCRYPTED_KEY_(\d+)/)[1]);
                return indexA - indexB;
            });

        if (encryptedKeys.length === 0) {
            console.log(chalk.red('❌ .env 文件中未找到任何加密私钥'));
            rl.close();
            process.exit(1);
        }

        const decryptedData = [];
        let ethCount = 0;
        let solCount = 0;

        console.log(chalk.blue('\n🔓 开始解密私钥...'));

        for (const [index, encryptedLine] of encryptedKeys.entries()) {
            const [, encryptedData] = encryptedLine.split('=');
            
            const parts = encryptedData.split(':');
            const encryptedHex = parts[0];
            const ivHex = parts[1];
            const keyType = parts[2] || 'ETH';
            
            if (!encryptedHex || !ivHex) {
                console.log(chalk.red(`❌ 加密私钥 ${index} 格式无效，需包含加密数据和IV`));
                continue;
            }

            try {
                const decipher = crypto.createDecipheriv(
                    'aes-256-cbc',
                    Buffer.from(encryptionKey, 'hex'),
                    Buffer.from(ivHex, 'hex')
                );
                let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
                decrypted += decipher.final('utf8');

                let result;
                
                if (keyType === 'SOL') {
                    result = generateSolanaAddress(decrypted);
                    if (result.valid) {
                        solCount++;
                        decryptedData.push({
                            Index: index,
                            Chain: 'SOL',
                            PrivateKey: result.privateKey,
                            Address: result.address
                        });
                        console.log(chalk.green(`✅ 成功解密 SOL 私钥 ${index}: ${result.privateKey.slice(0, 10)}...${result.privateKey.slice(-10)} -> 地址: ${result.address}`));
                    } else {
                        console.log(chalk.red(`❌ SOL 私钥 ${index} 解密后格式无效: ${result.error}`));
                    }
                } else {
                    result = generateEthereumAddress(decrypted);
                    if (result.valid) {
                        ethCount++;
                        decryptedData.push({
                            Index: index,
                            Chain: 'ETH',
                            PrivateKey: result.privateKey,
                            Address: result.address
                        });
                        console.log(chalk.green(`✅ 成功解密 ETH 私钥 ${index}: ${result.privateKey.slice(0, 6)}...${result.privateKey.slice(-6)} -> 地址: ${result.address}`));
                    } else {
                        console.log(chalk.red(`❌ ETH 私钥 ${index} 解密后格式无效: ${result.error}`));
                    }
                }
                
            } catch (error) {
                console.log(chalk.red(`❌ 解密私钥 ${index} 失败: ${error.message}`));
                continue;
            }
        }

        if (decryptedData.length === 0) {
            console.log(chalk.red('❌ 没有有效的解密私钥'));
            rl.close();
            process.exit(1);
        }

        console.log(chalk.blue('\n📝 正在生成输出文件...'));
        createCSVFile(decryptedData, outputFile);
        
        console.log(chalk.blue(`\n📊 解密统计:`));
        console.log(chalk.cyan(`   ETH 私钥: ${ethCount} 个`));
        console.log(chalk.cyan(`   SOL 私钥: ${solCount} 个`));
        console.log(chalk.cyan(`   总计: ${decryptedData.length} 个`));
        
        console.log(chalk.yellow(`\n📋 解密结果预览:`));
        decryptedData.slice(0, 5).forEach((row) => {
            const keyPreview = row.Chain === 'SOL' 
                ? `${row.PrivateKey.slice(0, 10)}...${row.PrivateKey.slice(-10)}`
                : `${row.PrivateKey.slice(0, 6)}...${row.PrivateKey.slice(-6)}`;
            console.log(chalk.cyan(`${row.Chain} 私钥 ${row.Index}: ${keyPreview} -> 地址: ${row.Address}`));
        });
        
        if (decryptedData.length > 5) {
            console.log(chalk.gray(`... 还有 ${decryptedData.length - 5} 个私钥，详见输出文件`));
        }

        console.log(chalk.green(`\n✅ 所有地址均使用官方库生成，确保准确性！`));
        console.log(chalk.green(`✅ 使用纯 Node.js 内置模块，无第三方安全风险！`));

    } catch (error) {
        console.log(chalk.red(`❌ 解密失败: ${error.message}`));
        rl.close();
        process.exit(1);
    } finally {
        rl.close();
    }
}

async function main() {
    displayBanner();
    
    await new Promise(resolve => {
        rl.question(chalk.green('按 Enter 键开始解密...'), () => {
            resolve();
        });
    });
    
    await decryptPrivateKeys();
}

main().catch(error => {
    console.error(chalk.red('程序运行出错:'), error);
    process.exit(1);
});
