import { ImageResponse } from 'next/og'
import React from 'react'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title')

    if (!title) {
      return new Response('Missing title parameter', { status: 400 })
    }

    // Trim title and add ellipsis if too long
    const MAX_TITLE_LENGTH = 80
    const trimmedTitle = title.length > MAX_TITLE_LENGTH 
      ? `${title.slice(0, MAX_TITLE_LENGTH)}...`
      : title

    // Adjust font size based on title length
    const titleFontSize = title.length > 50 ? '44px' : '56px'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#e75410',
            padding: '60px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexWrap: 'wrap',
            opacity: 0.1,
          }}>
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={`arrow-${i}-${Math.floor(i / 10)}-${i % 10}`}
                style={{
                  color: 'white',
                  fontSize: '24px',
                  fontFamily: 'monospace',
                  margin: '10px',
                }}
              >
                {'>'}
              </div>
            ))}
          </div>

          {/* Logo and Star */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}>
            <div style={{
              fontSize: '120px',
              fontFamily: 'Georgia, serif',
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: '-0.02em',
            }}>
              rSearch
            </div>
            <div style={{
              marginLeft: '20px',
              color: 'white',
              fontSize: '60px',
            }}>
              *
            </div>
          </div>

          {/* Article Title with Prefix */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            marginBottom: '40px',
            maxWidth: '90%',
            gap: '16px',
          }}>
            <div style={{
              fontSize: '36px',
              fontFamily: 'system-ui, sans-serif',
              color: 'white',
              opacity: 0.8,
            }}>
              Discover insights about
            </div>
            <div style={{
              fontSize: titleFontSize,
              fontFamily: 'system-ui, sans-serif',
              color: 'white',
              fontWeight: 'bold',
              lineHeight: 1.2,
            }}>
              {trimmedTitle}
            </div>
          </div>

          {/* URL */}
          <div style={{
            fontSize: '32px',
            fontFamily: 'monospace',
            color: 'white',
            opacity: 0.7,
          }}>
            http://rsearch.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    console.error(e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
