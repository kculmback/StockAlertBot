import moment from 'moment';

export default function handleNonOkayResponse(store, interval) {
  console.info(
    moment().format('LTS') +
      ': Error occured checking ' +
      store +
      '. Retrying in',
    interval.value,
    interval.unit
  );
}
