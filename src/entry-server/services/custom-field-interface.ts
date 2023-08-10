import type {
  t_custom_field as TCustomField,
} from '@prisma/client'

export type CustomField = {
  id_custom_field: TCustomField['id_custom_field']
  field: TCustomField['field']
  type: TCustomField['type']
  required: TCustomField['required']
  label: TCustomField['label']
  placeholder: TCustomField['placeholder']
  is_option: TCustomField['is_option']
  idx: TCustomField['idx']
}