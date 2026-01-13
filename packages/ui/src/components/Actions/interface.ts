import type React from 'react';


export interface ActionsProps {
  /**
   * @desc 包含多个操作项的列表
   * @descEN A list containing multiple action items.
   */
  items: ItemType[];
  /**
   * @desc 组件被点击时的回调函数。
   * @descEN Callback function when component is clicked.
   */
  onClick?: (menuInfo: {
    item: ItemType;
    key: string;
    keyPath: string[];
    domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
  }) => void;
  /**
   * @desc 变体
   * @descEN Variant.
   * @default 'borderless'
   */
  variant?: 'borderless' | 'filled' | 'outlined';
  /**
   * @desc 附加样式 className
   * @descEN
   */
  classNames?: string;
}

export interface ActionsItemProps extends Omit<ActionsProps, 'items' | 'variant'> {
  item: ItemType;
}

export interface ItemType {
  /**
   * @desc 自定义操作的唯一标识
   * @descEN Unique identifier for the custom action.
   */
  key?: string;
  /**
   * @desc 自定义操作的显示标签
   * @descEN Display label for the custom action.
   */
  label?: string;
  /**
   * @desc 自定义操作的图标
   * @descEN Icon for the custom action.
   */
  icon?: React.ReactNode;
  /**
   * @desc 点击自定义操作按钮时的回调函数
   * @descEN Callback function when the custom action button is clicked.
   */
  onItemClick?: (info?: ItemType) => void;
  /**
   * @desc 自定义渲染操作项内容
   * @descEN Custom render action item content
   */
  actionRender?: ((item: ItemType) => React.ReactNode) | React.ReactNode;
}
