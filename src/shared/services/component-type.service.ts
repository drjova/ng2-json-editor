/*
 * This file is part of ng2-json-editor.
 * Copyright (C) 2016 CERN.
 *
 * ng2-json-editor is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * ng2-json-editor is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ng2-json-editor; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 * In applying this license, CERN does not
 * waive the privileges and immunities granted to it by virtue of its status
 * as an Intergovernmental Organization or submit itself to any jurisdiction.
*/

import { Injectable } from '@angular/core';

import { JSONSchema } from '../interfaces';

@Injectable()
export class ComponentTypeService {

  /**
   * It returns the editor specific type of given schema
   * In other words, which component to use for given schema.
   *
   * Possible values:
   *  - string, number, boolean, object, enum
   *  - primitive-list, table-list, complex-list
   *  - disabled, autocomplete
   *
   * @param {Object} schema
   * @return {string}
   */
  getComponentType(schema: JSONSchema): string {
    if (!schema) {
      throw new Error('schema is undefined');
    }

    const schemaType = schema.type;
    if (!schemaType) {
      if (Object.keys(schema).length === 0) { // if shema === {} (empty object)
        return 'raw';
      }
    } else if (schemaType === 'string') {
      if (schema.autocompletionConfig) {
        return 'autocomplete';
      } else if (schema.enum) {
        return 'enum';
      }
    } else if (schemaType === 'object') {
      if (schema.properties['$ref']) {
        return 'ref';
      }
    } else if (schemaType === 'array') {
      const itemSchema = schema.items;
      if (itemSchema.type === 'object' && !itemSchema.properties['$ref']) {
        // complex-array: if it's an object array
        // if its elements have at least a property with object (not ref-field)
        // or a non-primitive array.
        const isComplexArray = Object.keys(itemSchema.properties)
          .some(prop => {
            const propSchema = itemSchema.properties[prop];
            return (propSchema.type === 'object' && !propSchema.properties['$ref']) ||
              (propSchema.type === 'array' && (propSchema.items.type === 'object' || propSchema.items.type === 'array'));
          });
        if (isComplexArray) {
          return 'complex-list';
        } else {
          return 'table-list';
        }
      } else {
        // if schema.items.type is not object!
        return 'primitive-list';
      }
    }
    // execution reaches here if schemaType is either
    // 'number', 'integer', 'string' or something else which is currently not supported
    return schemaType;
  }
}
