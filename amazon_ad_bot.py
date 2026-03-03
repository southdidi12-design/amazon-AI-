import pandas as pd
import numpy as np
import logging
from datetime import datetime
import random

# --- 配置部分 ---
class Config:
    # 你的目标 ACOS (例如 0.25 代表 25%)
    TARGET_ACOS = 0.25
    # 单次点击出价上限 (防止 AI 乱出价)
    MAX_BID = 5.00
    # 最低出价 (保留一点点曝光)
    MIN_BID = 0.10
    # 止损阈值：如果花费超过这个数且销量为0，视为“烧钱词”
    SPEND_THRESHOLD_NO_SALES = 20.0
    # 激进程度 (1.0 为中性，越高越激进)
    AGGRESSION_FACTOR = 1.1

# --- 日志设置 ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("AmazonBot")

class AmazonAdBot:
    # --- 操作常量，提高代码可维护性 ---
    ACTION_STOP_LOSS = "大幅降价 (止损)"
    ACTION_EXPAND = "提价 (扩量)"
    ACTION_CONTROL_COST = "降价 (控本)"
    ACTION_HOLD = "维持"
    REASON_OBSERVE = "数据不足，观察中"

    def __init__(self):
        self.config = Config()
        logger.info(f"初始化 AI 助手: 目标 ACOS {self.config.TARGET_ACOS*100}%")

    def fetch_report(self):
        """
        模拟从亚马逊 API 获取广告报告。
        在真实场景中，这里会使用 requests 请求 Amazon Advertising API。
        """
        logger.info("正在获取广告数据...")
        
        # 模拟生成 10 条关键词数据
        data = []
        campaigns = ['Campaign_Spring', 'Campaign_Summer', 'Campaign_Tech']
        keywords = ['wireless mouse', 'gaming keyboard', 'usb hub', 'monitor stand', 'webcam 1080p']
        
        for i in range(10):
            clicks = random.randint(0, 200)
            impressions = clicks * random.randint(10, 50) + random.randint(100, 1000)
            spend = round(clicks * random.uniform(0.5, 2.5), 2)
            
            # 模拟销量：有些词有转化，有些没有
            orders = 0
            sales = 0.0
            if clicks > 5 and random.random() > 0.3:
                orders = int(clicks * random.uniform(0.05, 0.2))
                sales = round(orders * random.uniform(20.0, 50.0), 2)
            
            # 制造一些“烧钱词” (高花费，0销量)
            if i == 2: 
                spend = 50.0
                sales = 0.0
                orders = 0
            
            data.append({
                'campaign': random.choice(campaigns),
                'keyword': random.choice(keywords),
                'match_type': random.choice(['BROAD', 'EXACT']),
                'current_bid': round(random.uniform(0.8, 2.0), 2),
                'impressions': impressions,
                'clicks': clicks,
                'spend': spend,
                'sales': sales,
                'orders': orders
            })
            
        df = pd.DataFrame(data)
        logger.info(f"成功获取 {len(df)} 条关键词数据")
        return df

    def calculate_metrics(self, df):
        """计算核心指标"""
        # CPC (Cost Per Click)
        df['cpc'] = df['spend'] / df['clicks'].replace(0, 1)
        
        # CVR (Conversion Rate)
        df['cvr'] = df['orders'] / df['clicks'].replace(0, 1)
        
        # ACOS (Advertising Cost of Sales)
        # 如果 Sales 为 0，ACOS 设为无穷大
        df['acos'] = df.apply(lambda x: x['spend'] / x['sales'] if x['sales'] > 0 else float('inf'), axis=1)
        
        return df

    def optimize_bids(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        核心 AI 决策引擎 (向量化版本)
        """
        logger.info("正在执行智能竞价分析...")

        # --- 1. 定义所有逻辑条件 (布尔掩码) ---
        cond_bleeder = (df['sales'] == 0) & (df['spend'] > self.config.SPEND_THRESHOLD_NO_SALES)
        cond_winner = (df['sales'] > 0) & (df['acos'] < self.config.TARGET_ACOS)
        cond_loser = (df['sales'] > 0) & (df['acos'] > self.config.TARGET_ACOS)

        # --- 2. 使用 np.select 定义操作和原因 ---
        conditions = [cond_bleeder, cond_winner, cond_loser]
        
        # 定义操作
        action_choices = [self.ACTION_STOP_LOSS, self.ACTION_EXPAND, self.ACTION_CONTROL_COST]
        df['action'] = np.select(conditions, action_choices, default=self.ACTION_HOLD)

        # 定义原因
        reason_choices = [
            "花费 $" + df['spend'].astype(str) + " 无出单",
            "ACOS " + (df['acos'] * 100).round(1).astype(str) + "% 优秀",
            "ACOS " + (df['acos'] * 100).round(1).astype(str) + "% 过高"
        ]
        df['reason'] = np.select(conditions, reason_choices, default=self.REASON_OBSERVE)

        # --- 3. 向量化计算新出价 ---
        # 默认新出价等于当前出价
        df['new_bid'] = df['current_bid']

        # 计算烧钱词出价
        df.loc[cond_bleeder, 'new_bid'] = self.config.MIN_BID

        # 计算表现优秀词的出价
        if cond_winner.any():
            target_cpc_winner = (df.loc[cond_winner, 'sales'] / df.loc[cond_winner, 'clicks']) * self.config.TARGET_ACOS
            suggested_bid_winner = target_cpc_winner * self.config.AGGRESSION_FACTOR
            
            # 确保提价，并应用上下限
            final_bid_winner = np.maximum(suggested_bid_winner, df.loc[cond_winner, 'current_bid'] * 1.1)
            df.loc[cond_winner, 'new_bid'] = np.minimum(final_bid_winner, self.config.MAX_BID)

        # 计算表现不佳词的出价
        if cond_loser.any():
            target_cpc_loser = (df.loc[cond_loser, 'sales'] / df.loc[cond_loser, 'clicks']) * self.config.TARGET_ACOS
            
            # 应用下限并限制上限
            df.loc[cond_loser, 'new_bid'] = np.minimum(np.maximum(target_cpc_loser, self.config.MIN_BID), self.config.MAX_BID)

        # 统一格式化
        df['new_bid'] = df['new_bid'].round(2)

        return df

    def run(self):
        """主执行流程"""
        # 1. 获取数据
        raw_data = self.fetch_report()
        
        # 2. 清洗与计算
        processed_data = self.calculate_metrics(raw_data)
        
        # 3. AI 优化
        optimized_data = self.optimize_bids(processed_data)
        
        # 4. 输出报告
        self.export_report(optimized_data)

    def export_report(self, df):
        """格式化输出结果"""
        print("\n" + "="*80)
        print(f"AMAZON AI 广告优化报告 - {datetime.now().strftime('%Y-%m-%d')}")
        print("="*80)
        
        # 筛选关键列进行显示
        cols = ['keyword', 'match_type', 'spend', 'sales', 'acos', 'current_bid', 'new_bid', 'action', 'reason']
        
        # 格式化 ACOS 列以便阅读
        display_df = df[cols].copy()
        display_df['acos'] = display_df['acos'].apply(lambda x: f"{x:.1%}" if not np.isinf(x) else "Inf")
        
        # 打印表格
        print(display_df.to_string(index=False))
        
        # 模拟保存 CSV
        filename = f"optimization_report_{datetime.now().strftime('%Y%m%d')}.csv"
        logger.info(f"报告已生成，建议保存为: {filename}")
        print("\n" + "="*80)

if __name__ == "__main__":
    bot = AmazonAdBot()
    bot.run()
