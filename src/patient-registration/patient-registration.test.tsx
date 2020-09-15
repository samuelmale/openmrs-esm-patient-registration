import React from 'react';
import ReactDOM from 'react-dom';
import { render, wait } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as backendController from './patient-registration.resource';
import { PatientRegistration, getDeathInfo, initialFormValues } from './patient-registration.component';
import { getAddressTemplateMock } from '../../__mocks__/openmrs-esm-api.mock';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'openmrs/spa/patient-registration',
  }),
}));

describe('patient registration', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<PatientRegistration />, div);
  });
});

describe('patient registration sections', () => {
  const testSectionExists = (labelText: string) => {
    it(labelText + ' exists', async () => {
      const { getByLabelText } = render(<PatientRegistration />);
      await wait();
      expect(getByLabelText(labelText)).not.toBeNull();
    });
  };

  testSectionExists('Demographics Section');
  testSectionExists('Contact Info Section');
  testSectionExists('Death Info Section');
});

describe('getDeathInfo', () => {
  it('builds deathInfo for dead patient', () => {
    const expected = {
      dead: true,
      deathDate: '2020-01-01',
      causeOfDeath: 'stroke',
    };

    const values = { ...initialFormValues, isDead: true, deathDate: '2020-01-01', deathCause: 'stroke' };
    expect(getDeathInfo(values)).toStrictEqual(expected);
  });

  it('builds deathInfo for not dead patient', () => {
    const expected = {
      dead: false,
    };

    expect(getDeathInfo(initialFormValues)).toStrictEqual(expected);
  });
});

describe('form submit', () => {
  const fillRequiredFields = async getByLabelText => {
    const givenNameInput = getByLabelText('givenName') as HTMLInputElement;
    const familyNameInput = getByLabelText('familyName') as HTMLInputElement;
    const dateOfBirthInput = getByLabelText('birthdate') as HTMLInputElement;
    const genderSelect = getByLabelText('gender') as HTMLSelectElement;

    userEvent.type(givenNameInput, 'Paul');
    userEvent.type(familyNameInput, 'Gaihre');
    userEvent.type(dateOfBirthInput, '1993-08-02');
    userEvent.selectOptions(genderSelect, 'Male');

    await wait();
  };

  beforeAll(() => {
    spyOn(backendController, 'getAddressTemplate').and.returnValue(getAddressTemplateMock());
  });

  it('saves the patient', async () => {
    spyOn(backendController, 'savePatient').and.returnValue(Promise.resolve({}));

    const { getByText, getByLabelText } = render(<PatientRegistration />);
    await wait();

    await fillRequiredFields(getByLabelText);

    userEvent.click(getByText('Register Patient'));
    await wait();

    expect(backendController.savePatient).toHaveBeenCalledWith(expect.anything(), {
      identifiers: [], //TODO when the identifer story is finished: { identifier: '', identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334', location: '' }
      // identifiers: [{ identifier: '', identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334', location: '' }],
      person: {
        addresses: [{ address1: '', address2: '', cityVillage: '', country: '', postalCode: '', stateProvince: '' }],
        attributes: [{ attributeType: '14d4f066-15f5-102d-96e4-000c29c2a5d7', value: '' }],
        birthdate: '1993-08-02',
        birthdateEstimated: false,
        gender: 'M',
        names: [{ givenName: 'Paul', middleName: '', familyName: 'Gaihre', preferred: true }],
        dead: false,
      },
    });
  });

  it('saves the patient with their additional name', async () => {
    spyOn(backendController, 'savePatient').and.returnValue(Promise.resolve({}));

    const { getByText, getByLabelText } = render(<PatientRegistration />);
    await wait();

    await fillRequiredFields(getByLabelText);

    const addNameInLocalLanguageCheckbox = getByLabelText('addNameInLocalLanguage') as HTMLInputElement;

    userEvent.click(addNameInLocalLanguageCheckbox);
    await wait();

    const additionalGivenNameInput = getByLabelText('additionalGivenName') as HTMLInputElement;
    const additionalMiddleNameInput = getByLabelText('additionalMiddleName') as HTMLInputElement;
    const additionalFamilyNameInput = getByLabelText('additionalFamilyName') as HTMLInputElement;

    userEvent.type(additionalGivenNameInput, 'Local Given Name');
    userEvent.type(additionalMiddleNameInput, 'Local Middle Name');
    userEvent.type(additionalFamilyNameInput, 'Local Family Name');

    userEvent.click(getByText('Register Patient'));
    await wait();

    expect(backendController.savePatient).toHaveBeenCalledWith(expect.anything(), {
      identifiers: [],
      person: {
        addresses: [{ address1: '', address2: '', cityVillage: '', country: '', postalCode: '', stateProvince: '' }],
        attributes: [{ attributeType: '14d4f066-15f5-102d-96e4-000c29c2a5d7', value: '' }],
        birthdate: '1993-08-02',
        birthdateEstimated: false,
        gender: 'M',
        names: [
          { givenName: 'Paul', middleName: '', familyName: 'Gaihre', preferred: true },
          {
            givenName: 'Local Given Name',
            middleName: 'Local Middle Name',
            familyName: 'Local Family Name',
            preferred: false,
          },
        ],
        dead: false,
      },
    });
  });

  it('saves the patient with death info', async () => {
    spyOn(backendController, 'savePatient').and.returnValue(Promise.resolve({}));

    const { getByText, getByLabelText } = render(<PatientRegistration />);
    await wait();

    await fillRequiredFields(getByLabelText);

    const isDeadCheckbox = getByLabelText('isDead') as HTMLInputElement;

    userEvent.click(isDeadCheckbox);
    await wait();

    const deathDate = getByLabelText('deathDate') as HTMLInputElement;
    const deathCause = getByLabelText('deathCause') as HTMLSelectElement;

    userEvent.type(deathDate, '2020-01-01');
    userEvent.selectOptions(deathCause, 'Stroke');

    userEvent.click(getByText('Register Patient'));
    await wait();

    expect(backendController.savePatient).toHaveBeenCalledWith(expect.anything(), {
      identifiers: [], //TODO when the identifer story is finished: { identifier: '', identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334', location: '' }
      person: {
        addresses: [{ address1: '', address2: '', cityVillage: '', country: '', postalCode: '', stateProvince: '' }],
        attributes: [{ attributeType: '14d4f066-15f5-102d-96e4-000c29c2a5d7', value: '' }],
        birthdate: '1993-08-02',
        birthdateEstimated: false,
        gender: 'M',
        names: [{ givenName: 'Paul', middleName: '', familyName: 'Gaihre', preferred: true }],
        dead: true,
        deathDate: '2020-01-01',
        causeOfDeath: 'Stroke',
      },
    });
  });

  it('should not save the patient if validation fails', async () => {
    spyOn(backendController, 'savePatient').and.returnValue(Promise.resolve({}));
    const { getByText, getByLabelText } = render(<PatientRegistration />);
    await wait();

    const givenNameInput = getByLabelText('givenName') as HTMLInputElement;

    userEvent.type(givenNameInput, '');
    await wait();

    userEvent.click(getByText('Register Patient'));
    await wait();

    expect(backendController.savePatient).not.toHaveBeenCalled();
  });
});
