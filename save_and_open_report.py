from amazon_ad_bot import AmazonAdBot
from datetime import datetime
import os

def main():
    bot = AmazonAdBot()
    raw = bot.fetch_report()
    processed = bot.calculate_metrics(raw)
    optimized = bot.optimize_bids(processed)

    filename = f"optimization_report_{datetime.now().strftime('%Y%m%d')}.csv"
    path = os.path.join(os.getcwd(), filename)
    optimized.to_csv(path, index=False)
    print(f"已保存报告: {path}")

    # 在 macOS 上用默认程序打开
    try:
        os.system(f"open '{path}'")
        print("已在默认程序中打开报告")
    except Exception as e:
        print("打开文件时出错:", e)

if __name__ == '__main__':
    main()
