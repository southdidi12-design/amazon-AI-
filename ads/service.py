from amazon_ad_bot import AmazonAdBot


def run_bot_and_get_results():
    """调用已存在的模拟 bot，返回一个结构化的 dict 列表（可 JSON 序列化）。"""
    bot = AmazonAdBot()
    raw = bot.fetch_report()
    processed = bot.calculate_metrics(raw)
    optimized = bot.optimize_bids(processed)

    # 将 DataFrame 转为 records
    records = optimized.to_dict(orient='records')
    return records
