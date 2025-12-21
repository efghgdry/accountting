import React from 'react'
import { Card, Empty } from 'antd'
import { TagsOutlined } from '@ant-design/icons'

const Categories = () => {
  return (
    <div>
      <h1>分类管理</h1>
      <Card>
        <Empty
          icon={<TagsOutlined style={{ fontSize: 32 }} />}
          description="分类管理功能已整合到科目管理中"
        />
      </Card>
    </div>
  )
}

export default Categories