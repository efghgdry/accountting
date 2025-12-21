import React from 'react'
import { Card, Empty } from 'antd'
import { PieChartOutlined } from '@ant-design/icons'

const Budgets = () => {
  return (
    <div>
      <h1>预算管理</h1>
      <Card>
        <Empty
          icon={<PieChartOutlined style={{ fontSize: 32 }} />}
          description="预算管理功能已暂不支持"
        />
      </Card>
    </div>
  )
}

export default Budgets