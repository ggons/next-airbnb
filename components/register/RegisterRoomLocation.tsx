import React, { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import { useDispatch } from "react-redux";
import palette from "../../styles/palette";
import Button from "../common/button/Button";
import NavigationIcon from "../../public/static/svg/register/navigation.svg";
import Input from "../common/Input";
import { countryList } from "../../lib/staticData";
import RegisterSelector from "../common/selector/RegisterSelector";
import { registerRoomActions } from "../../store/registerRoom";
import { useSelector } from "../../store";
import RegisterRoomFooter from "./RegisterRoomFooter";

const Container = styled.div`
  padding: 62px 30px;
  h2 {
    font-size: 19px;
    font-weight: 800;
    margin-bottom: 56px;
  }
  h3 {
    font-weight: bold;
    color: ${palette.gray_76};
    margin-bottom: 6px;
  }
  .register-room-step-info {
    margin-top: 6px;
    margin-bottom: 30px;
  }
  .register-room-location-country-selector-wrapper {
    width: 385px;
    margin-bottom: 24px;
  }
  .register-room-location-button-wrapper {
    margin-bottom: 24px;
  }
  .register-room-location-city-district {
    max-width: 385px;
    display: flex;
    margin-bottom: 24px;
    > div:first-child {
      margin-right: 24px;
    }
  }
  .register-room-location-street-address {
    max-width: 385px;
    margin-bottom: 24px;
  }
  .register-room-location-detail-address {
    max-width: 385px;
    margin-bottom: 24px;
  }
  .register-room-location-postcode {
    max-width: 385px;
  }
`;

const RegisterLocation: React.FC = () => {
  const [loading, setLoading] = useState<boolean>();

  const country = useSelector((state) => state.registerRoom.country);
  const city = useSelector((state) => state.registerRoom.city);
  const district = useSelector((state) => state.registerRoom.district);
  const streetAddress = useSelector(
    (state) => state.registerRoom.streetAddress
  );
  const detailAddress = useSelector(
    (state) => state.registerRoom.detailAddress
  );
  const postcode = useSelector((state) => state.registerRoom.postcode);

  const dispatch = useDispatch();

  const changeCountryDispatch = useCallback((string) => {
    dispatch(registerRoomActions.setCountry(string));
  }, []);

  const onChangeCountry = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      changeCountryDispatch(e.target.value);
    },
    []
  );

  const onChangeCity = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(registerRoomActions.setCity(e.target.value));
  }, []);

  const onChangeDistrict = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(registerRoomActions.setDistrict(e.target.value));
    },
    []
  );

  const onChangeStreetAdress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(registerRoomActions.setStreetAddress(e.target.value));
    },
    []
  );

  const onChangeDetailAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(registerRoomActions.setDetailAddress(e.target.value));
    },
    []
  );

  const onChangePostcode = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(registerRoomActions.setPostcode(e.target.value));
    },
    []
  );

  const isAllValueFilled = useMemo(() => {
    if (!country || !city || !district || !streetAddress || !postcode) {
      return false;
    }
    return true;
  }, [country, city, district, streetAddress, postcode]);

  //* 현재 위치 사용하기
  const onClickGetCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const URL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;
          const { data } = await axios.get(URL);
          console.log(data);
          const addressComponent = data.results[0].address_components;
          const { lat, lng } = data.results[0].geometry.location;
          dispatch(
            registerRoomActions.setCountry(addressComponent[4].long_name)
          );
          dispatch(registerRoomActions.setCity(addressComponent[3].long_name));
          dispatch(
            registerRoomActions.setDistrict(addressComponent[2].long_name)
          );
          dispatch(
            registerRoomActions.setStreetAddress(
              `${addressComponent[1].long_name} ${addressComponent[0].long_name}`
            )
          );
          dispatch(
            registerRoomActions.setPostcode(addressComponent[5].long_name)
          );
          dispatch(registerRoomActions.setLatitude(lat));
          dispatch(registerRoomActions.setLongitude(lng));

          setLoading(false);
        } catch (e) {
          console.log(e.message);
        }
      },

      (e) => console.log(e)
    );
  };
  return (
    <Container>
      <h2>숙소의 위치를 알려주세요.</h2>
      <h3>4단계</h3>
      <p className="register-room-step-info">
        정확한 숙소 주소는 게스트가 예약을 완료한 후에만 공개됩니다.
      </p>
      <div className="register-room-location-button-wrapper">
        <Button
          color="dark_cyan"
          colorReverse
          icon={<NavigationIcon />}
          onClick={onClickGetCurrentLocation}
        >
          현재 위치 사용
        </Button>
      </div>
      <div className="register-room-location-country-selector-wrapper">
        <RegisterSelector
          options={countryList}
          onChange={onChangeCountry}
          disabledOptions={["국가/지역 선택"]}
          value={country}
        />
      </div>
      <div className="register-room-location-city-district">
        <Input label="시/도" value={city} onChange={onChangeCity} />
        <Input label="시/군/구" value={district} onChange={onChangeDistrict} />
      </div>
      <div className="register-room-location-street-address">
        <Input
          label="도로명주소"
          value={streetAddress}
          onChange={onChangeStreetAdress}
        />
      </div>
      <div className="register-room-location-detail-address">
        <Input
          label="동호수(선택 사항)"
          value={detailAddress}
          onChange={onChangeDetailAddress}
        />
      </div>
      <div className="register-room-location-postcode">
        <Input label="우편번호" value={postcode} onChange={onChangePostcode} />
      </div>
      <RegisterRoomFooter
        nextHref="/room/register/amentities"
        isAllValueFilled={isAllValueFilled}
      />
    </Container>
  );
};

export default RegisterLocation;