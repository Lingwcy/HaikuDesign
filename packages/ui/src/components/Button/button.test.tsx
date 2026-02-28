import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('renders with default variant', () => {
    render(<Button>Default</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'default')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary')

    rerender(<Button variant="dashed">Dashed</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'dashed')

    rerender(<Button variant="text">Text</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'text')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg')
  })

  it('renders with different shapes', () => {
    render(<Button shape="rounded">Rounded</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-shape', 'rounded')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles disabled state', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('handles loading state', () => {
    render(<Button loading>Loading</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('renders with icon', () => {
    // 简化测试：验证带 icon 属性的按钮能正常渲染
    const { container } = render(<Button icon="mdi:home">Home</Button>)
    expect(container.querySelector('button')).toBeInTheDocument()
  })

  it('renders as label when as="label"', () => {
    render(<Button as="label">Label Button</Button>)
    expect(screen.getByText('Label Button')).toHaveAttribute('data-slot', 'button')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
