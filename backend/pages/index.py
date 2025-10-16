import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Save and load page content for sharing
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with page content
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            page_id = body_data.get('pageId')
            content = body_data.get('content')
            
            cur.execute(
                "INSERT INTO pages (id, content) VALUES (%s, %s) "
                "ON CONFLICT (id) DO UPDATE SET content = %s, updated_at = CURRENT_TIMESTAMP",
                (page_id, json.dumps(content), json.dumps(content))
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'pageId': page_id})
            }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {})
            page_id = params.get('pageId', '/')
            
            cur.execute("SELECT content FROM pages WHERE id = %s", (page_id,))
            row = cur.fetchone()
            
            if row:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'content': row[0]})
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Page not found'})
                }
    
    finally:
        cur.close()
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
