import React from 'react';

import FreeText from '../../../../app/js/components/orderEntry/addForm/FreeText';

const props = {
  activateSaveButton: jest.fn(),
  fields: {},
  fieldErrors: {},
  careSetting: {display: 'Outpatient'},
  options: {
    dispensingUnit: [{
      display: 'kits',
      uuid: 'ABC-56Y',
    }]
  }
};

describe('Test for Free text form', () => {
  it('should render component', () => {
    const wrapper = shallow(<FreeText {...props} />  );
    expect(wrapper).toMatchSnapshot()
  });
  it('should render options if they exist in state', () => {
    const wrapper = shallow(<FreeText {...props} />  );
    expect(wrapper.find('option')).toHaveLength(1);
  });
});
