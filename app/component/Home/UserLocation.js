import React, { useEffect, nemo, memo } from 'react'
import UseLocation from '../../../utils/useLocation';

 function UserLocation(){
  const { location ,coordinate } = UseLocation()  
 
  useEffect(() => {
    console.log('rerender...... use location')
  }, [])
  
  return (
    null
  )
}

export default memo(UserLocation)