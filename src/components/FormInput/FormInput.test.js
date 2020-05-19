import React from 'react';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import faker from 'faker';

import FormInput from './';

const SELECT_OPTIONS = [
  {
    label: faker.name.firstName(),
    value: faker.name.lastName()
  },
  {
    label: faker.name.firstName(),
    value: faker.name.lastName()
  },
  {
    label: faker.name.firstName(),
    value: faker.name.lastName()
  }
];

describe('FormInput', () => {
  describe('Render', () => {
    const label = 'Name';
    const id = 'name-test-id';
    const input = shallow(<FormInput id={id} label={label} />);

    const inputRendered = input.find('Input').dive().find('input').render();

    it('should render a label', () => {
      expect(input.find('label').text()).toEqual(label);
    });

    it('should should use ID as name if not provided', () => {
      expect(inputRendered.attr('name')).toEqual(id);
    });
  });

  describe('Events', () => {
    describe('Text', () => {
      const changeTestValue = faker.random.word();
      const inputTestValue = faker.random.word();

      let changeTest = null;
      let inputTest = null;

      function handleChange (event) {
        changeTest = event.target.value;
      }

      function handleInput (event) {
        inputTest = event.target.value;
      }

      const input = shallow(
        <FormInput
          id="name"
          label="Name"
          onChange={handleChange}
          onInput={handleInput}
        />
      )
        .find('Input')
        .dive()
        .find('input');

      it('should fire the change handler', () => {
        input.simulate('change', {
          target: {
            value: changeTestValue
          }
        });
        expect(changeTest).toEqual(changeTestValue);
      });

      it('should fire the input handler', () => {
        input.simulate('input', {
          target: {
            value: inputTestValue
          }
        });
        expect(inputTest).toEqual(inputTestValue);
      });
    });

    describe('Textarea', () => {
      const changeTestValue = faker.random.words();
      const inputTestValue = faker.random.words();

      let changeTest = null;
      let inputTest = null;

      function handleChange (event) {
        changeTest = event.target.value;
      }

      function handleInput (event) {
        inputTest = event.target.value;
      }

      const input = shallow(
        <FormInput
          id="comments"
          type="textarea"
          onChange={handleChange}
          onInput={handleInput}
        />
      )
        .find('Textarea')
        .dive()
        .find('textarea');

      it('should fire the change handler', () => {
        input.find('textarea').simulate('change', {
          target: {
            value: changeTestValue
          }
        });
        expect(changeTest).toEqual(changeTestValue);
      });

      it('should fire the input handler', () => {
        input.find('textarea').simulate('input', {
          target: {
            value: inputTestValue
          }
        });
        expect(inputTest).toEqual(inputTestValue);
      });
    });

    describe('Select', () => {
      let changeTest = null;
      let inputTest = null;

      function handleChange (event) {
        changeTest = SELECT_OPTIONS[0];
      }

      function handleInput (event) {
        inputTest = event.target.value;
      }

      const input = shallow(
        <FormInput
          id="organization"
          type="select"
          options={SELECT_OPTIONS}
          onChange={handleChange}
          onInput={handleInput}
        />
      )
        .find('Select')
        .dive()
        .find('StateManager');

      it('does fire the change handler', () => {
        const selectEvent = {
          action: 'select-option',
          name: 'organization',
          option: SELECT_OPTIONS[0]
        };
        input.simulate('change', SELECT_OPTIONS[0], selectEvent);
        expect(changeTest).toEqual(SELECT_OPTIONS[0]);
      });

      it('should fire the input handler', () => {
        input.simulate('input', {
          target: {
            value: SELECT_OPTIONS[1].value
          }
        });
        expect(inputTest).toEqual(SELECT_OPTIONS[1].value);
      });
    });

    describe('Datetime', () => {
      const input = mount(<FormInput id="datetime" type="datetime" />);

      it('should display datepicker on focus', () => {
        input.find('input').simulate('focus');
        expect(input.find('.rdtOpen').exists()).toEqual(true);
      });

      it('should display datepicker on click', () => {
        input.find('input').simulate('click');
        expect(input.find('.rdtOpen').exists()).toEqual(true);
      });

      it('should display datepicker on clicking icon', () => {
        input.find('svg').simulate('click');
        expect(input.find('.rdtOpen').exists()).toEqual(true);
      });
    });
  });

  describe('Invalid Events', () => {
    const consoleStub = sinon.stub(console, 'error');

    describe('Text', () => {
      const input = shallow(
        <FormInput id="name" label="Name" onChange={'test'} onInput={'test'} />
      );

      it('should not throw an error when trying to fire the change handler', () => {
        expect(input.simulate('change')).toEqual({});
      });

      it('should not throw an error when trying to fire the input handler', () => {
        expect(input.simulate('input')).toEqual({});
      });

      expect(consoleStub.callCount).toEqual(2);
      expect(
        consoleStub.calledWithMatch('Warning: Failed prop type: Invalid prop')
      ).toEqual(true);
    });

    describe('Textarea', () => {
      const input = shallow(
        <FormInput
          id="comments"
          type="textarea"
          onChange={'test'}
          onInput={'test'}
        />
      );

      it('should not throw an error when trying to fire the change handler', () => {
        expect(input.simulate('change')).toEqual({});
      });

      it('should not throw an error when trying to fire the input handler', () => {
        expect(input.simulate('input')).toEqual({});
      });

      expect(consoleStub.callCount).toEqual(2);
      expect(
        consoleStub.calledWithMatch('Warning: Failed prop type: Invalid prop')
      ).toEqual(true);
    });

    describe('Select', () => {
      const input = shallow(
        <FormInput
          id="organization"
          type="select"
          options={SELECT_OPTIONS}
          onChange={'test'}
          onInput={'test'}
        />
      );

      it('should not throw an error when trying to fire the change handler', () => {
        const event = SELECT_OPTIONS[0];
        const selectEvent = {
          action: 'select-option',
          name: 'organization',
          option: SELECT_OPTIONS[0]
        };
        expect(input.simulate('change', event, selectEvent)).toEqual({});
      });

      it('should not throw an error when trying to fire the input handler', () => {
        expect(input.simulate('input')).toEqual({});
      });

      expect(consoleStub.callCount).toEqual(2);
      expect(
        consoleStub.calledWithMatch('Warning: Failed prop type: Invalid prop')
      ).toEqual(true);
    });
    describe('Datetime', () => {
      const input = shallow(<FormInput id="datetime" type="datetime" />);

      it('should not throw an error when trying to fire the change handler', () => {
        expect(input.simulate('change')).toEqual({});
      });

      it('should not throw an error when trying to fire the input handler', () => {
        expect(input.simulate('input')).toEqual({});
      });

      expect(consoleStub.callCount).toEqual(2);
      expect(
        consoleStub.calledWithMatch('Warning: Failed prop type: Invalid prop')
      ).toEqual(true);
    });

    console.error.restore();
  });
});
