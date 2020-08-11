import React from 'react';
import { render } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { UnidentifiedPatientInput } from './unidentified-patient-input.component';

describe('unidentified patient input', () => {
  const mockSetName = jest.fn();

  const setupInput = async () => {
    const { getByLabelText } = render(
      <Formik initialValues={{ unidentifiedPatient: false }} onSubmit={null}>
        <Form>
          <UnidentifiedPatientInput name="unidentifiedPatient" setName={mockSetName} />
        </Form>
      </Formik>,
    );
    return getByLabelText('unidentifiedPatient') as HTMLInputElement;
  };

  it('exists', async () => {
    const input = await setupInput();
    expect(input.type).toEqual('checkbox');
  });

  it('calls setName for givenName, middleName, familyName', async () => {
    mockSetName.mockReset();
    await setupInput();
    expect(mockSetName.mock.calls.length).toBe(3);
    expect(mockSetName).toHaveBeenCalledWith('givenName', '');
    expect(mockSetName).toHaveBeenCalledWith('middleName', '');
    expect(mockSetName).toHaveBeenCalledWith('familyName', '');
  });
});