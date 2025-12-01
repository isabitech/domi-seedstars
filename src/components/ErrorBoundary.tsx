import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Result, Button, Typography, Space } from 'antd';
import { BugOutlined, ReloadOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || null
    });
  }

  handleReload = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Result
            status="error"
            icon={<BugOutlined style={{ color: '#ff4d4f' }} />}
            title="Application Error"
            subTitle="Something went wrong. We're sorry for the inconvenience."
            extra={[
              <Button 
                key="reload" 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                Reload Application
              </Button>,
              <Button 
                key="reset" 
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            ]}
          >
            <div style={{ textAlign: 'left', maxWidth: '600px' }}>
              <Paragraph>
                <Text strong>Error Details:</Text>
              </Paragraph>
              <Paragraph>
                <Text code>{this.state.error?.message}</Text>
              </Paragraph>
              
              {import.meta.env.DEV && (
                <details style={{ marginTop: '16px' }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                    <Text type="secondary">Technical Details (Development Mode)</Text>
                  </summary>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto'
                  }}>
                    {this.state.error?.stack}
                    {this.state.errorInfo}
                  </pre>
                </details>
              )}
            </div>
            
            <Space direction="vertical" style={{ marginTop: '20px' }}>
              <Text type="secondary">
                If this problem persists, please contact support.
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Dominion Seedstars - Financial Management System
              </Text>
            </Space>
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}