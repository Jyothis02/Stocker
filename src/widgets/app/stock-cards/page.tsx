'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

interface Stock {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    imageUrl?: string;
    description?: string;
}

interface StockCardsData {
    stocks: Stock[];
}

export default function StockCards() {
    const theme = useTheme();
    const { getToolOutput } = useWidgetSDK();
    const data = getToolOutput<StockCardsData>();

    if (!data || !data.stocks) {
        return (
            <div style={{
                padding: '24px',
                textAlign: 'center',
                color: theme === 'dark' ? '#fff' : '#000',
                fontFamily: 'system-ui, sans-serif'
            }}>
                Loading stocks...
            </div>
        );
    }

    const stocksList = data.stocks;

    if (stocksList.length === 0) {
        return (
            <div style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: theme === 'dark' ? '#94a3b8' : '#64748b',
                fontFamily: 'system-ui, sans-serif',
                background: theme === 'dark' ? '#1e293b' : '#ffffff',
                borderRadius: '16px',
                border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                maxWidth: '500px',
                margin: '0 auto'
            }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📈</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>
                    No Stocks Tracked
                </div>
                <div style={{ fontSize: '14px' }}>
                    Your watchlist is empty or your query returned no matches.
                </div>
            </div>
        );
    }

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#0f172a' : '#f8fafc';
    const cardBg = isDark ? '#1e293b' : '#ffffff';
    const cardBorder = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const textMuted = isDark ? '#94a3b8' : '#64748b';
    const primaryColor = '#F43F5E'; // Rose 500

    return (
        <div style={{
            padding: '16px',
            background: bgColor,
            color: textColor,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            boxSizing: 'border-box',
            width: '100%',
            maxWidth: '850px',
            margin: '0 auto',
            border: `1px solid ${cardBorder}`
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                borderBottom: `1px solid ${cardBorder}`,
                paddingBottom: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>🚀</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                            Finhub Stock Scout
                        </h2>
                        <p style={{ margin: 0, fontSize: '12px', color: textMuted }}>
                            Live market quotes via Finnhub REST API
                        </p>
                    </div>
                </div>
                <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    background: isDark ? '#334155' : '#e2e8f0',
                    color: textMuted,
                    padding: '4px 8px',
                    borderRadius: '20px'
                }}>
                    {stocksList.length} Stock{stocksList.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px',
            }}>
                {stocksList.map((stock) => {
                    const isPositive = stock.change >= 0;
                    const statusColor = isPositive ? '#10b981' : primaryColor;
                    const statusBg = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)';

                    // Initials for avatar fallback
                    const initials = stock.ticker.slice(0, 2);

                    return (
                        <div
                            key={stock.ticker}
                            style={{
                                background: cardBg,
                                border: `1px solid ${cardBorder}`,
                                borderRadius: '12px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'default',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    marginBottom: '12px'
                                }}>
                                    {/* Stock Logo or Fallback */}
                                    {stock.imageUrl ? (
                                        <img
                                            src={stock.imageUrl}
                                            alt={`${stock.name} logo`}
                                            onError={(e) => {
                                                // fallback if error loading image
                                                (e.target as HTMLElement).style.display = 'none';
                                                const nextSibling = (e.target as HTMLElement).nextElementSibling;
                                                if (nextSibling) {
                                                    (nextSibling as HTMLElement).style.display = 'flex';
                                                }
                                            }}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                objectFit: 'cover',
                                                border: `1px solid ${cardBorder}`
                                            }}
                                        />
                                    ) : null}

                                    {/* Fallback Initials Block (only shown if no image or image error) */}
                                    <div
                                        className="avatar-fallback"
                                        style={{
                                            display: stock.imageUrl ? 'none' : 'flex',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            background: primaryColor,
                                            color: '#ffffff',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {initials}
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontWeight: '800',
                                            fontSize: '16px',
                                            color: textColor
                                        }}>
                                            {stock.ticker}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: textMuted,
                                            maxWidth: '120px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {stock.name}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    margin: '8px 0 12px 0',
                                    fontSize: '12px',
                                    color: textMuted,
                                    lineHeight: '1.4',
                                    height: '48px',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {stock.description || 'No company description available.'}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'space-between',
                                marginTop: '8px',
                                borderTop: `1px solid ${cardBorder}`,
                                paddingTop: '12px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '10px', color: textMuted }}>Price</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                        ${stock.price.toFixed(2)}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end'
                                }}>
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: statusColor,
                                        background: statusBg,
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontFamily: 'monospace'
                                    }}>
                                        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                    </span>
                                    <span style={{
                                        fontSize: '10px',
                                        color: textMuted,
                                        marginTop: '2px',
                                        fontFamily: 'monospace'
                                    }}>
                                        {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
