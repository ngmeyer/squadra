'use client'

import { useState } from 'react'
import { Plus, X, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VariantGroup } from '@/lib/supabase/queries'

interface VariantBuilderProps {
  variantGroups: VariantGroup[]
  onChange: (groups: VariantGroup[]) => void
  basePrice: number
}

export function VariantBuilder({ variantGroups, onChange, basePrice }: VariantBuilderProps) {
  const addGroup = () => {
    onChange([
      ...variantGroups,
      {
        name: '',
        options: [{ value: '', price_adjustment_cents: 0 }],
      },
    ])
  }

  const removeGroup = (groupIndex: number) => {
    onChange(variantGroups.filter((_, i) => i !== groupIndex))
  }

  const updateGroupName = (groupIndex: number, name: string) => {
    const updated = [...variantGroups]
    updated[groupIndex].name = name
    onChange(updated)
  }

  const addOption = (groupIndex: number) => {
    const updated = [...variantGroups]
    updated[groupIndex].options.push({ value: '', price_adjustment_cents: 0 })
    onChange(updated)
  }

  const removeOption = (groupIndex: number, optionIndex: number) => {
    const updated = [...variantGroups]
    updated[groupIndex].options = updated[groupIndex].options.filter((_, i) => i !== optionIndex)
    onChange(updated)
  }

  const updateOption = (
    groupIndex: number,
    optionIndex: number,
    field: 'value' | 'price_adjustment_cents',
    value: string | number
  ) => {
    const updated = [...variantGroups]
    if (field === 'value') {
      updated[groupIndex].options[optionIndex].value = value as string
    } else {
      updated[groupIndex].options[optionIndex].price_adjustment_cents = value as number
    }
    onChange(updated)
  }

  // Generate variant combinations preview
  const generateVariants = () => {
    if (variantGroups.length === 0) return []

    const combinations: Array<{ combo: Record<string, string>; price: number }> = []

    const generate = (index: number, current: Record<string, string>, currentPrice: number) => {
      if (index === variantGroups.length) {
        combinations.push({ combo: { ...current }, price: currentPrice })
        return
      }

      const group = variantGroups[index]
      for (const option of group.options) {
        current[group.name] = option.value
        generate(index + 1, current, currentPrice + option.price_adjustment_cents)
      }
    }

    generate(0, {}, basePrice)
    return combinations
  }

  const variants = generateVariants()

  return (
    <div className="space-y-6">
      {/* Variant Groups */}
      <div className="space-y-4">
        {variantGroups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="Group name (e.g., Size, Color)"
                  value={group.name}
                  onChange={(e) => updateGroupName(groupIndex, e.target.value)}
                  className="max-w-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroup(groupIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Option Value</Label>
                    <Input
                      placeholder="e.g., Small, Red"
                      value={option.value}
                      onChange={(e) =>
                        updateOption(groupIndex, optionIndex, 'value', e.target.value)
                      }
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">Price Adjust</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={option.price_adjustment_cents / 100}
                        onChange={(e) =>
                          updateOption(
                            groupIndex,
                            optionIndex,
                            'price_adjustment_cents',
                            Math.round(parseFloat(e.target.value || '0') * 100)
                          )
                        }
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(groupIndex, optionIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(groupIndex)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addGroup} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Variant Group
      </Button>

      {/* Variant Matrix Preview */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Variant Preview ({variants.length} variants)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    {variantGroups.map((group) => (
                      <th key={group.name} className="text-left py-2 px-2 font-medium">
                        {group.name || 'Group'}
                      </th>
                    ))}
                    <th className="text-right py-2 px-2 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.slice(0, 20).map((variant, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {variantGroups.map((group) => (
                        <td key={group.name} className="py-2 px-2">
                          {variant.combo[group.name] || '-'}
                        </td>
                      ))}
                      <td className="text-right py-2 px-2 font-mono">
                        ${(variant.price / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {variants.length > 20 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  + {variants.length - 20} more variants
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
